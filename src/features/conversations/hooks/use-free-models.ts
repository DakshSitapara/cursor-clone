import { useEffect, useState } from "react";

interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  supported_parameters?: string[];
  architecture?: {
    modality?: string;
  };
  pricing: {
    prompt: string;
    completion: string;
    image?: string;
  };
}

export interface FreeModel {
  id: string;
  label: string;
  context: number;
  tools: boolean;
  vision: boolean;
  provider: string;
  providerLogo: string;
}

const BLOCKED_MODELS = new Set([
  "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
  "liquid/lfm-2.5-1.2b-instruct:free",
  "liquid/lfm-2.5-1.2b-thinking:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "google/gemma-3n-e2b-it:free",
  "google/gemma-3n-e4b-it:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
]);

const PROVIDER_MAP: Array<{
  prefix: string;
  provider: string;
  logo: string;
}> = [
  { prefix: "qwen/", provider: "Qwen", logo: "alibaba" },
  { prefix: "meta-llama/", provider: "Meta", logo: "llama" },
  { prefix: "google/", provider: "Google", logo: "google" },
  { prefix: "deepseek/", provider: "DeepSeek", logo: "deepseek" },
  { prefix: "nvidia/", provider: "NVIDIA", logo: "nvidia" },
  { prefix: "mistralai/", provider: "Mistral", logo: "mistral" },
  { prefix: "openai/", provider: "OpenAI", logo: "openai" },
  { prefix: "anthropic/", provider: "Anthropic", logo: "anthropic" },
  { prefix: "z-ai/", provider: "Z.ai", logo: "zhipuai" },
  { prefix: "minimax/", provider: "MiniMax", logo: "inference" },
  { prefix: "arcee-ai/", provider: "Arcee AI", logo: "inference" },
  { prefix: "stepfun/", provider: "StepFun", logo: "inference" },
  { prefix: "moonshotai/", provider: "Moonshot", logo: "moonshotai" },
  { prefix: "x-ai/", provider: "xAI", logo: "xai" },
  { prefix: "openrouter/", provider: "OpenRouter", logo: "openrouter" },
  { prefix: "cognitivecomputations/", provider: "Venice", logo: "venice" },
];

function getProviderFromId(id: string): { provider: string; logo: string } {
  for (const entry of PROVIDER_MAP) {
    if (id.startsWith(entry.prefix)) {
      return { provider: entry.provider, logo: entry.logo };
    }
  }
  return { provider: "Other", logo: "openrouter" };
}

function formatContext(ctx: number): string {
  if (ctx >= 1_000_000) return `${(ctx / 1_000_000).toFixed(0)}M`;
  if (ctx >= 1_000) return `${(ctx / 1_000).toFixed(0)}K`;
  return String(ctx);
}

const PROVIDER_PRIORITY: Record<string, number> = {
  Qwen: 0,
  OpenAI: 1,
  DeepSeek: 2,
  Meta: 3,
  NVIDIA: 4,
  Mistral: 5,
  Google: 6,
  "Z.ai": 7,
  MiniMax: 8,
  "Arcee AI": 9,
  StepFun: 10,
  Moonshot: 11,
  xAI: 12,
  OpenRouter: 13,
  Other: 99,
};

function sortModels(a: FreeModel, b: FreeModel): number {
  if (a.tools !== b.tools) return a.tools ? -1 : 1;
  const pa = PROVIDER_PRIORITY[a.provider] ?? 50;
  const pb = PROVIDER_PRIORITY[b.provider] ?? 50;
  if (pa !== pb) return pa - pb;
  return b.context - a.context;
}

const CACHE_KEY = "openrouter_free_models";
const CACHE_TTL_MS = 1000 * 60 * 30;

interface CacheEntry {
  models: FreeModel[];
  timestamp: number;
}

function readCache(): FreeModel[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry.models;
  } catch {
    return null;
  }
}

function writeCache(models: FreeModel[]): void {
  try {
    const entry: CacheEntry = { models, timestamp: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
  }
}

export function useFreeModels() {
  const [models, setModels] = useState<FreeModel[]>(() => readCache() ?? []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setModels(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchModels() {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/models", {
          headers: { "HTTP-Referer": window.location.origin },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        if (cancelled) return;

        const free: FreeModel[] = (data.data as OpenRouterModel[])
          .filter(
            (m) =>
              parseFloat(m.pricing.prompt) === 0 &&
              parseFloat(m.pricing.completion) === 0 &&
              !BLOCKED_MODELS.has(m.id),
          )
          .map((m) => {
            const { provider, logo } = getProviderFromId(m.id);
            const params = m.supported_parameters ?? [];
            const supportsTools = params.includes("tools");
            const supportsVision =
              params.includes("vision") ||
              m.architecture?.modality?.includes("image") === true;

            return {
              id: m.id,
              label: `${m.name} (${formatContext(m.context_length)} ctx)`,
              context: m.context_length,
              tools: supportsTools,
              vision: supportsVision,
              provider,
              providerLogo: logo,
            };
          })
          .sort(sortModels);

        writeCache(free);
        setModels(free);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch models",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchModels();

    return () => {
      cancelled = true;
    };
  }, []);

  return { models, loading, error };
}
