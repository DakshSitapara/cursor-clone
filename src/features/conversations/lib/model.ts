export const DEFAULT_MODEL_ID = "qwen/qwen3-coder:free";

export const MODELS = [
  {
    group: "Qwen",
    provider: "alibaba" as const,
    items: [
      { id: "qwen/qwen3.6-plus-preview:free",        label: "Qwen 3.6 Plus (1M ctx)",     tools: true  },
      { id: "qwen/qwen3-next-80b-a3b-instruct:free", label: "Qwen3 Next 80B",              tools: true  },
      { id: "qwen/qwen3-coder:free",                 label: "Qwen3 Coder 480B ⭐",         tools: true  },
    ],
  },
  {
    group: "OpenAI",
    provider: "openai" as const,
    items: [
      { id: "openai/gpt-oss-120b:free", label: "GPT OSS 120B (131K ctx)", tools: true },
      { id: "openai/gpt-oss-20b:free",  label: "GPT OSS 20B (131K ctx)",  tools: true },
    ],
  },
  {
    group: "Meta",
    provider: "llama" as const,
    items: [
      { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B",       tools: true  },
      { id: "meta-llama/llama-3.2-3b-instruct:free",  label: "Llama 3.2 3B (131K)", tools: false },
    ],
  },
  {
    group: "NVIDIA",
    provider: "nvidia" as const,
    items: [
      { id: "nvidia/nemotron-3-super-120b-a12b:free", label: "Nemotron 3 Super 120B (262K)", tools: true },
      { id: "nvidia/nemotron-3-nano-30b-a3b:free",    label: "Nemotron 3 Nano 30B (256K)",   tools: true },
      { id: "nvidia/nemotron-nano-12b-v2-vl:free",    label: "Nemotron Nano 12B VL",         tools: true },
      { id: "nvidia/nemotron-nano-9b-v2:free",        label: "Nemotron Nano 9B",             tools: true },
    ],
  },
  {
    group: "Google",
    provider: "google" as const,
    items: [
      { id: "google/gemma-3-27b-it:free",  label: "Gemma 3 27B (Vision)",  tools: false },
      { id: "google/gemma-3-12b-it:free",  label: "Gemma 3 12B (Vision)",  tools: false },
      { id: "google/gemma-3-4b-it:free",   label: "Gemma 3 4B (Vision)",   tools: false },
      { id: "google/gemma-3n-e4b-it:free", label: "Gemma 3n E4B (8K)",     tools: false },
      { id: "google/gemma-3n-e2b-it:free", label: "Gemma 3n E2B (8K)",     tools: false },
    ],
  },
  {
    group: "Z.ai",
    provider: "zhipuai" as const,
    items: [
      { id: "z-ai/glm-4.5-air:free", label: "GLM-4.5 Air (131K)", tools: true },
    ],
  },
  {
    group: "MiniMax",
    provider: "inference" as const,
    items: [
      { id: "minimax/minimax-m2.5:free", label: "MiniMax M2.5 (197K)", tools: true },
    ],
  },
  {
    group: "Arcee AI",
    provider: "inference" as const,
    items: [
      { id: "arcee-ai/trinity-large-preview:free", label: "Trinity Large Preview (131K)", tools: true },
      { id: "arcee-ai/trinity-mini:free",          label: "Trinity Mini (131K)",          tools: true },
    ],
  },
  {
    group: "StepFun",
    provider: "inference" as const,
    items: [
      { id: "stepfun/step-3.5-flash:free", label: "Step 3.5 Flash 196B (256K)", tools: true },
    ],
  },
  {
    group: "Nous Research",
    provider: "inference" as const,
    items: [
      { id: "nousresearch/hermes-3-llama-3.1-405b:free", label: "Hermes 3 Llama 405B (131K)", tools: false },
    ],
  },
  {
    group: "LiquidAI",
    provider: "inference" as const,
    items: [
      { id: "liquid/lfm-2.5-1.2b-thinking:free",  label: "LFM 2.5 1.2B Thinking (33K)", tools: false },
      { id: "liquid/lfm-2.5-1.2b-instruct:free",  label: "LFM 2.5 1.2B Instruct (33K)", tools: false },
    ],
  },
  {
    group: "Venice",
    provider: "venice" as const,
    items: [
      { id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", label: "Dolphin Mistral 24B (33K)", tools: false },
    ],
  },
  {
    group: "OpenRouter",
    provider: "openrouter" as const,
    items: [
      { id: "openrouter/free", label: "Auto (Best Available Free)", tools: true },
    ],
  },
] as const;