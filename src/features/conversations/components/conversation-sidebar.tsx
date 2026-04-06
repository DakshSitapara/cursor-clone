import ky from "ky";
import { toast } from "sonner";
import { useState } from "react";
import {
  CopyIcon,
  HistoryIcon,
  LoaderIcon,
  PlusIcon,
  CheckIcon,
  ChevronDownIcon,
  WrenchIcon,
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
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorSeparator,
} from "@/components/ai-elements/model-selector";

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
import { useFreeModels, type FreeModel } from "../hooks/use-free-models";

const DEFAULT_MODEL_ID = "openrouter/free";

function groupModelsByProvider(models: FreeModel[]) {
  const groups = new Map<string, FreeModel[]>();
  for (const model of models) {
    const existing = groups.get(model.provider);
    if (existing) {
      existing.push(model);
    } else {
      groups.set(model.provider, [model]);
    }
  }
  return Array.from(groups.entries()).map(([provider, items]) => ({
    provider,
    logo: items[0].providerLogo,
    items,
  }));
}

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
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);

  const { models: freeModels, loading: modelsLoading } = useFreeModels();

  const activeModel = freeModels.find((m) => m.id === selectedModelId) ?? {
    id: DEFAULT_MODEL_ID,
    label: "Unknown Model",
    provider: "Unknown Provider",
    providerLogo: "",
    tools: true,
  };
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
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleCancel = async () => {
    try {
      await ky.post("/api/messages/cancel", { json: { projectId } });
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
      if (!conversationId) return;
    }

    try {
      await ky.post("/api/messages", {
        json: {
          conversationId,
          message: message.text,
          model: selectedModelId,
          supportsTools: activeModel.tools ?? true,
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
          {!activeModel.tools && (
            <div className="mb-2 flex items-center gap-1.5 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1.5">
              <WrenchIcon className="size-3 shrink-0" />
              <span>
                This model doesn&apos;t support file tools. It will chat only —
                no file reads/writes.
              </span>
            </div>
          )}
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
              <PromptInputTools>
                <ModelSelector
                  open={modelSelectorOpen}
                  onOpenChange={setModelSelectorOpen}
                >
                  <ModelSelectorTrigger asChild>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="gap-1.5 text-muted-foreground hover:text-foreground h-6 px-1.5"
                    >
                      <ModelSelectorLogo
                        provider={activeModel.providerLogo}
                        className="size-3"
                      />
                      <span className="text-xs max-w-22.5 truncate">
                        {activeModel.label}
                      </span>
                      <ChevronDownIcon className="size-3 opacity-50" />
                    </Button>
                  </ModelSelectorTrigger>

                  <ModelSelectorContent className="w-full">
                    <ModelSelectorInput placeholder="Search models..." />
                    <ModelSelectorList>
                      <ModelSelectorEmpty>
                        {modelsLoading
                          ? "Loading models..."
                          : "No models found."}
                      </ModelSelectorEmpty>
                      {groupModelsByProvider(freeModels).map((group, i) => (
                        <span key={group.provider}>
                          {i > 0 && <ModelSelectorSeparator />}
                          <ModelSelectorGroup heading={group.provider}>
                            {group.items.map((model) => (
                              <ModelSelectorItem
                                key={model.id}
                                value={model.id}
                                onSelect={() => {
                                  setSelectedModelId(model.id);
                                  setModelSelectorOpen(false);
                                }}
                              >
                                <ModelSelectorLogo provider={group.logo} />
                                <ModelSelectorName>
                                  {model.label}
                                </ModelSelectorName>
                                {!model.tools && (
                                  <span
                                    title="No tool/file support"
                                    className="ml-1 text-[10px] text-amber-500 border border-amber-500/40 rounded px-1 leading-4"
                                  >
                                    no tools
                                  </span>
                                )}
                                {selectedModelId === model.id && (
                                  <CheckIcon className="size-3.5 ml-auto text-primary" />
                                )}
                              </ModelSelectorItem>
                            ))}
                          </ModelSelectorGroup>
                        </span>
                      ))}
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
              </PromptInputTools>

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
