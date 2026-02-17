import { inngest } from "@/inngest/client";
import { Id } from "../../../../convex/_generated/dataModel";
import { NonRetriableError } from "inngest";
import { convex } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api";
import {
  CODING_AGENT_SYSTEM_PROMPT,
  TITLE_GENERATOR_SYSTEM_PROMPT,
} from "./constants";
import { DEFAULT_CONVERSATION_TITLE } from "../constants";
import { createAgent, createNetwork, gemini, openai } from "@inngest/agent-kit";
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
            content: "AI failed to process your message (TODO)",
          });
        });
      }
    },
  },
  {
    event: "message/sent",
  },
  async ({ event, step }) => {
    const { messageId, message, conversationId, projectId } =
      event.data as MessageEvent;

    const internalKey = process.env.CURSOR_CLONE_CONVEX_INTERNAL_KEY;

    if (!internalKey) {
      throw new NonRetriableError(
        "CURSOR_CLONE_CONVEX_INTERNAL_KEY not configured",
      );
    }

    await step.sleep("wait-for-db-sync", "1s");

    const conversation = await step.run("get-conversation", async () => {
      return await convex.query(api.system.getConversationById, {
        internalKey,
        conversationId,
      });
    });

    if (!conversation) {
      throw new NonRetriableError("Conversation not found");
    }

    const recentMessages = await step.run("get-recent-messages", async () => {
      return await convex.query(api.system.getRecentMessages, {
        internalKey,
        conversationId,
        limit: 10,
      });
    });

    let systemPrompt = CODING_AGENT_SYSTEM_PROMPT;

    const contextMessages = recentMessages.filter(
      (message) => message._id === messageId && message.content.trim() !== "",
    );

    if (contextMessages.length > 0) {
      const historyText = contextMessages
        .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
        .join("\n\n");
      systemPrompt += `\n\n##Previous conversation(for context only -do not repeat these responses):
        \n${historyText}\n\n#Current Request:\nRespond  to ONLY to hte user's new message below.
         Do not repeat or reference your previous conversation.`;
    }

    const shouldGenerateTitle =
      conversation.title === DEFAULT_CONVERSATION_TITLE;

    if (shouldGenerateTitle) {
      const titleAgent = createAgent({
        name: "title-generator",
        system: TITLE_GENERATOR_SYSTEM_PROMPT,
        model: openai({
          model: "z-ai/glm-4.7-flash",
          apiKey: process.env.OPENROUTER_API_KEY,
          baseUrl: "https://openrouter.ai/api/v1/",
        }),
      });

      const { output } = await titleAgent.run(message, { step });

      const textMessage = output.find(
        (message) => message.type === "text" && message.role === "assistant",
      );

      if (textMessage?.type === "text") {
        const title =
          typeof textMessage.content === "string"
            ? textMessage.content.trim()
            : textMessage.content
                .map((c) => c.text)
                .join("")
                .trim();

        if (title) {
          await step.run("update-conversation-title", async () => {
            return await convex.mutation(api.system.updateConversationTitle, {
              internalKey,
              conversationId,
              title,
            });
          });
        }
      }
    }

    const codingAgent = createAgent({
      name: "Cursor Clone",
      description: "An expert AI Coding Agent",
      system: systemPrompt,
      model: openai({
        model: "z-ai/glm-4.7-flash",
        apiKey: process.env.OPENROUTER_API_KEY,
        baseUrl: "https://openrouter.ai/api/v1/",
      }),
      tools: [
        createListFilesTool({ internalKey, projectId }),
        createReadFilesTool({ internalKey }),
        createUpdateFileTool({ internalKey }),
        createCreateFilesTool({ internalKey, projectId }),
        createCreateFolderTool({ internalKey, projectId }),
        createDeleteFilesTool({ internalKey }),
        createRenameFileTool({ internalKey }),
        createScrapeUrlsTool(),
      ],
    });

    const network = createNetwork({
      name: "cursor-clone-network",
      agents: [codingAgent],
      maxIter: 20,
      router: ({ network }) => {
        const lastResult = network.state.results.at(-1);
        const hasTextResponse = lastResult?.output.some(
          (message) => message.type === "text" && message.role === "assistant",
        );
        const hasToolCalls = lastResult?.output.some(
          (message) => message.type === "tool_call",
        );
        if (hasTextResponse && !hasToolCalls) {
          return undefined;
        }
        return codingAgent;
      },
    });

    const result = await network.run(message);
    const lastResult = result.state.results.at(-1);
    const textMessage = lastResult?.output.find(
      (message) => message.type === "text" && message.role === "assistant",
    );

    let assistantResponse =
      "I Processed Your Request. Let me know if you need anything else.";

    if (textMessage?.type === "text") {
      assistantResponse =
        typeof textMessage.content === "string"
          ? textMessage.content.trim()
          : textMessage.content.map((c) => c.text).join("");
    }

    await step.run("update-assistant-message", async () => {
      return await convex.mutation(api.system.updateMessageContent, {
        messageId,
        internalKey,
        content: assistantResponse,
      });
    });
    return { success: true, messageId, conversationId };
  },
);
