import { z } from "zod";
import { createTool } from "@inngest/agent-kit";
import { firecrawl } from "@/lib/firecrawl";

const paramsSchema = z.object({
  urls: z.array(z.url("Invalid URL")).min(1, "Provide at least one URL"),
});

export const createScrapeUrlsTool = () => {
  return createTool({
    name: "scrapeURLs",
    description:
      "Scrapes the content from URLs to get Documention or reference mertials. Use this tool to get Documention or reference mertials from URLs. Returns markdown content form scraped Pages.",
    parameters: z.object({
      urls: z
        .array(z.string())
        .describe("Array of URLs to scrape content from"),
    }),
    handler: async (params, { step: toolStep }) => {
      const parsed = paramsSchema.safeParse(params);
      if (!parsed.success) {
        return `Error: ${parsed.error.issues[0].message}`;
      }
      const { urls } = parsed.data;
      try {
        return await toolStep?.run("scrape-urls", async () => {
          const results: { url: string; content: string }[] = [];
          for (const url of urls) {
            try {
              const result = await firecrawl.scrape(url, {
                formats: ["markdown"],
              });
              if (result.markdown) {
                results.push({
                  url,
                  content: result.markdown,
                });
              }
            } catch {
              results.push({
                url,
                content: `Error: Failed to scrape ${url}`,
              });
            }
          }
          if(results.length === 0) {
            return "No content found from provided URLs";
          }
          return JSON.stringify(results);
        });
      } catch (error) {
        return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  });
};
