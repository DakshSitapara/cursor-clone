import { z } from "zod";
import { createTool } from "@inngest/agent-kit";

import { convex } from "@/lib/convex-client";

import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

interface ListFilesToolOptions {
  projectId: Id<"projects">;
  internalKey: string;
}

export const createListFilesTool = ({
  internalKey,
  projectId,
}: ListFilesToolOptions) => {
  return createTool({
    name: "list-files",
    description:
      "Lists all files and folders form project. Return name, types, IDs, and parentID for each item. Item with parentId : null are at root level. Use the parentId to understand the folder structure- item with same parentId are in same folder.",
    parameters: z.object({}),
    handler: async (_, { step: toolStep }) => {
      try {
        return await toolStep?.run("list-files", async () => {
          const files = await convex.query(api.system.getProjectFiles, {
            internalKey,
            projectId,
          });

          const sorted = files.sort((a, b) => {
            if (a.type !== b.type) {
              return a.type === "folder" ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
          });

          const fileList = sorted.map((file) => {
            return {
              id: file._id,
              name: file.name,
              type: file.type,
              parentId: file.parentId ?? null,
            };
          });

          return JSON.stringify(fileList);
        });
      } catch (error) {
        return `Error listing files: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  });
};
