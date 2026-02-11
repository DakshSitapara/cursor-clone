import { inngest } from "@/inngest/client";
import { Id } from "../../../../convex/_generated/dataModel";
import { NonRetriableError } from "inngest";
import { convex } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api";

interface MessageEvent {
  messageId: Id<"messages">;
  //   conversationId: Id<"conversations">;
  //   projectId: Id<"projects">;
  //   message: string;
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
            })
        }
    }
  },
  {
    event: "message/sent",
  },
  async ({ event, step }) => {
    const { messageId } = event.data as MessageEvent;

    const internalKey = process.env.CURSOR_CLONE_CONVEX_INTERNAL_KEY;

    if (!internalKey) {
      throw new NonRetriableError(
        "CURSOR_CLONE_CONVEX_INTERNAL_KEY not configured",
      );
    }

    await step.sleep("wait-for-ai-to-processing", "5s");


    await step.run("update-assistant-message", async () => {
      return await convex.mutation(api.system.updateMessageContent, {
        messageId,
        internalKey,
        content: "AI is processing your message (TODO)",
      });
    });
  },
);
