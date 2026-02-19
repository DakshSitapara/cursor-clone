import ky from "ky";
import { toast } from "sonner";
import { useState } from "react";
import {
  CopyIcon,
  HistoryIcon,
  LoaderIcon,
  PlusIcon,
  CheckIcon,
} from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";

import { Button } from "@/components/ui/button";

import {
  useMessages,
  useConversation,
  useConversations,
  useCreateConversation,
} from "../hooks/use-conversations";

import { Id } from "../../../../convex/_generated/dataModel";
import { DEFAULT_CONVERSATION_TITLE } from "../constants";
import { PastConversationDialog } from "./past-conversation-dialog";
import { Shimmer } from "@/components/ai-elements/shimmer";

interface ConversationSidebarProps {
  projectId: Id<"projects">;
}

export const ConversationSidebar = ({
  projectId,
}: ConversationSidebarProps) => {
  const [input, setInput] = useState("");
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);

  const [pastConversationOpen, setPastConversationOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const createConversation = useCreateConversation();
  const conversations = useConversations(projectId);

  const activeConversationId =
    selectedConversationId ?? conversations?.[0]?._id ?? null;

  const activeConversation = useConversation(activeConversationId);
  const conversationMessages = useMessages(activeConversationId);

  const isProcessing = conversationMessages?.some(
    (message) => message.status === "processing",
  );

  const handleSelectMessage = async (message: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(message);

      setCopiedMessageId(messageId);

      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleCancel = async () => {
    try {
      await ky.post("/api/messages/cancel", {
        json: {
          projectId,
        },
      });
    } catch {
      toast.error("Failed to cancel request");
    }
  };

  const handleCreateConversation = async () => {
    try {
      const newConversation = await createConversation({
        name: DEFAULT_CONVERSATION_TITLE,
        projectId,
      });
      setSelectedConversationId(newConversation);
      return newConversation;
    } catch {
      toast.error("Failed to create new conversation");
      return null;
    }
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    if (isProcessing && !message.text) {
      await handleCancel();
      setInput("");
      return;
    }

    let conversationId = activeConversationId;
    if (!conversationId) {
      conversationId = await handleCreateConversation();
      if (!conversationId) {
        return;
      }
    }

    try {
      await ky.post("/api/messages", {
        json: {
          conversationId,
          message: message.text,
        },
      });
    } catch {
      toast.error("Failed to send message");
    }

    setInput("");
  };

  return (
    <>
      <PastConversationDialog
        projectId={projectId}
        open={pastConversationOpen}
        onOpenChange={setPastConversationOpen}
        onSelect={setSelectedConversationId}
      />
      <div className="flex flex-col h-full bg-sidebar">
        <div className="h-8.75 flex items-center justify-between border-b">
          <div className="text-sm pl-3 truncate">
            {activeConversation?.title ?? DEFAULT_CONVERSATION_TITLE}
          </div>
          <div className="flex items-center px-1 gap-1">
            <Button
              size="icon-xs"
              variant="highlight"
              onClick={() => setPastConversationOpen(true)}
            >
              <HistoryIcon className="size-3.5" />
            </Button>
            <Button
              size="icon-xs"
              variant="highlight"
              onClick={handleCreateConversation}
            >
              <PlusIcon className="size-3.5" />
            </Button>
          </div>
        </div>
        <Conversation className="flex-1">
          <ConversationContent>
            {conversationMessages?.map((message) => (
              <Message key={message._id} from={message.role}>
                <MessageContent>
                  {message.status === "processing" ? (
                    <div className="flex items-center text-muted-foreground">
                      <LoaderIcon className="animate-spin size-4 mr-2" />
                      <Shimmer duration={1}>Thinking...</Shimmer>
                    </div>
                  ) : message.status === "cancelled" ? (
                    <span className="text-muted-foreground italic">
                      Request cancelled
                    </span>
                  ) : (
                    <div>
                      <MessageResponse>{message.content}</MessageResponse>
                    </div>
                  )}
                </MessageContent>
                {message.role === "assistant" &&
                  message.status === "complete" && (
                    <MessageActions>
                      <MessageAction
                        label="Copy"
                        variant="ghost"
                        onClick={() =>
                          handleSelectMessage(message.content, message._id)
                        }
                      >
                        {copiedMessageId === message._id ? (
                          <CheckIcon className="size-4" />
                        ) : (
                          <CopyIcon className="size-4" />
                        )}
                      </MessageAction>
                    </MessageActions>
                  )}
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <div className="p-3">
          <PromptInput onSubmit={handleSubmit} className="mt-2">
            <PromptInputBody>
              <PromptInputTextarea
                placeholder="Ask anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isProcessing}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools />
              <PromptInputSubmit
                status={isProcessing ? "streaming" : undefined}
                disabled={isProcessing ? false : !input}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </>
  );
};
