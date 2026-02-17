import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export const useConversation = (id: Id<"conversations"> | null) => {
  return useQuery(api.conversations.getById, id ? { id } : "skip");
};

export const useMessages = (conversationId: Id<"conversations"> | null) => {
  return useQuery(
    api.conversations.getMessages,
    conversationId ? { conversationId } : "skip",
  );
};

export const useConversations = (projectId: Id<"projects">) => {
  return useQuery(api.conversations.getByProjectId, { projectId });
};

export const useCreateConversation = () => {
  return useMutation(api.conversations.create).withOptimisticUpdate(
    (localStore, args) => {
      const existingConversations = localStore.getQuery(
        api.conversations.getByProjectId,
        { projectId: args.projectId },
      );
      if (existingConversations !== undefined) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const now = Date.now();
        const newConversation = {
          ...args,
          _id: crypto.randomUUID() as Id<"conversations">,
          _creationTime: now,
          projectId: args.projectId,
          title: args.name,
          createdAt: now,
          updatedAt: now,
        };

        localStore.setQuery(
          api.conversations.getByProjectId,
          { projectId: args.projectId },
          [newConversation, ...existingConversations],
        );
      }
    },
  );
};
