import { inngest } from "@/inngest/client";
import { Id } from "../../../../convex/_generated/dataModel";
import { NonRetriableError } from "inngest";
import { convex } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api";
import {
  CODING_AGENT_SYSTEM_PROMPT,
  TITLE_GENERATOR_SYSTEM_PROMPT,
  PROJECT_NAME_GENERATOR_SYSTEM_PROMPT,
} from "./constants";
import { DEFAULT_CONVERSATION_TITLE, DEFAULT_PROJECT_TITLE } from "../constants";
import { createAgent, createNetwork, openai } from "@inngest/agent-kit";
import { createReadFilesTool } from "./tools/read-files";
import { createListFilesTool } from "./tools/list-files";
import { createUpdateFileTool } from "./tools/update-file";
import { createCreateFilesTool } from "./tools/create-files";
import { createCreateFolderTool } from "./tools/create-folder";
import { createDeleteFilesTool } from "./tools/delete-files";
import { createRenameFileTool } from "./tools/rename-file";
import { createScrapeUrlsTool } from "./tools/scrape-urls";

interface MessageEvent {
  messageId: Id<"messages">;
  conversationId: Id<"conversations">;
  projectId: Id<"projects">;
  message: string;
  model?: string;
  supportsTools?: boolean;
}

export const processMessage = inngest.createFunction(
  {
    id: "process-message",
    cancelOn: [
      {
        event: "message/cancel",
        if: "event.data.messageId == async.data.messageId",
      },
    ],
    onFailure: async ({ event, step }) => {
      const { messageId } = event.data.event.data as MessageEvent;
      const internalKey = process.env.CURSOR_CLONE_CONVEX_INTERNAL_KEY;

      if (internalKey) {
        await step.run("update-message-on-failure", async () => {
          return await convex.mutation(api.system.updateMessageContent, {
            messageId,
            internalKey,
            content: "AI failed to process your message. Please try again.",
          });
        });
      }
    },
  },
  { event: "message/sent" },
  async ({ event, step }) => {
    const { messageId, message, conversationId, projectId, model, supportsTools } =
      event.data as MessageEvent;

    const activeModel = model ?? "openrouter/free";
    const internalKey = process.env.CURSOR_CLONE_CONVEX_INTERNAL_KEY;

    if (!internalKey) {
      throw new NonRetriableError("CURSOR_CLONE_CONVEX_INTERNAL_KEY not configured");
    }

    await step.sleep("wait-for-db-sync", "1s");

    const [conversation, project] = await Promise.all([
      step.run("get-conversation", () =>
        convex.query(api.system.getConversationById, { internalKey, conversationId })
      ),
      step.run("get-project", () =>
        convex.query(api.system.getProjectById, { internalKey, projectId })
      ),
    ]);

    if (!conversation) throw new NonRetriableError("Conversation not found");
    if (!project) throw new NonRetriableError("Project not found");

    const recentMessages = await step.run("get-recent-messages", () =>
      convex.query(api.system.getRecentMessages, { internalKey, conversationId, limit: 10 })
    );

    let systemPrompt = CODING_AGENT_SYSTEM_PROMPT;

    const contextMessages = recentMessages.filter(
      (msg) => msg._id !== messageId && msg.content.trim() !== "",
    );

    if (contextMessages.length > 0) {
      const historyText = contextMessages
        .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join("\n\n");
      systemPrompt += `\n\n## Previous conversation (for context only — do not repeat these responses):\n${historyText}\n\n## Current Request:\nRespond ONLY to the user's new message below. Do not repeat or reference previous responses.`;
    }

    const agentModel = openai({
      model: activeModel,
      apiKey: process.env.OPENROUTER_API_KEY,
      baseUrl: "https://openrouter.ai/api/v1/",
    });

    if (conversation.title === DEFAULT_CONVERSATION_TITLE) {
      const titleAgent = createAgent({
        name: "title-generator",
        system: TITLE_GENERATOR_SYSTEM_PROMPT,
        model: agentModel,
      });

      const { output } = await titleAgent.run(message, { step });
      const titleMessage = output.find(
        (msg) => msg.type === "text" && msg.role === "assistant",
      );

      if (titleMessage?.type === "text") {
        const title =
          typeof titleMessage.content === "string"
            ? titleMessage.content.trim()
            : titleMessage.content.map((c) => c.text).join("").trim();

        if (title) {
          await step.run("update-conversation-title", () =>
            convex.mutation(api.system.updateConversationTitle, {
              internalKey,
              conversationId,
              title,
            })
          );
        }
      }
    }

    if (project.name === DEFAULT_PROJECT_TITLE) {
      const projectNameAgent = createAgent({
        name: "project-name-generator",
        system: PROJECT_NAME_GENERATOR_SYSTEM_PROMPT,
        model: agentModel,
      });

      const { output } = await projectNameAgent.run(message, { step });
      const nameMessage = output.find(
        (msg) => msg.type === "text" && msg.role === "assistant",
      );

      if (nameMessage?.type === "text") {
        const name =
          typeof nameMessage.content === "string"
            ? nameMessage.content.trim()
            : nameMessage.content.map((c) => c.text).join("").trim();

        if (name) {
          await step.run("update-project-name", () =>
            convex.mutation(api.system.updateProjectName, {
              internalKey,
              projectId,
              name,
            })
          );
        }
      }
    }

    const codingAgent = createAgent({
      name: "Cursor Clone",
      description: "An expert AI Coding Agent",
      system: systemPrompt,
      model: agentModel,
      tools: supportsTools
        ? [
            createListFilesTool({ internalKey, projectId }),
            createReadFilesTool({ internalKey }),
            createUpdateFileTool({ internalKey }),
            createCreateFilesTool({ internalKey, projectId }),
            createCreateFolderTool({ internalKey, projectId }),
            createDeleteFilesTool({ internalKey }),
            createRenameFileTool({ internalKey }),
            createScrapeUrlsTool(),
          ]
        : [],
    });

    const network = createNetwork({
      name: "cursor-clone-network",
      agents: [codingAgent],
      maxIter: 20,
      router: ({ network }) => {
        const lastResult = network.state.results.at(-1);
        const hasTextResponse = lastResult?.output.some(
          (msg) => msg.type === "text" && msg.role === "assistant",
        );
        const hasToolCalls = lastResult?.output.some(
          (msg) => msg.type === "tool_call",
        );
        if (hasTextResponse && !hasToolCalls) return undefined;
        return codingAgent;
      },
    });

    const result = await network.run(message);
    const lastResult = result.state.results.at(-1);
    const textMessage = lastResult?.output.find(
      (msg) => msg.type === "text" && msg.role === "assistant",
    );

    let assistantResponse = "I processed your request. Let me know if you need anything else.";

    if (textMessage?.type === "text") {
      assistantResponse =
        typeof textMessage.content === "string"
          ? textMessage.content.trim()
          : textMessage.content.map((c) => c.text).join("");
    }

    await step.run("update-assistant-message", () =>
      convex.mutation(api.system.updateMessageContent, {
        messageId,
        internalKey,
        content: assistantResponse,
      })
    );

    return { success: true, messageId, conversationId };
  },
);