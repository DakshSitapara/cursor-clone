import { z } from "zod";
import { createTool } from "@inngest/agent-kit";

import { convex } from "@/lib/convex-client";

import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

interface RenameFileToolOptions {
  internalKey: string;
}

const paramsSchema = z.object({
  fileId: z.string().min(1, "File Id is required"),
  newName: z.string().min(1, "File name is required"),
});

export const createRenameFileTool = ({
  internalKey,
}: RenameFileToolOptions) => {
  return createTool({
    name: "rename-file",
    description:
      "Renames a file or folder in project.",
    parameters: z.object({
      fileId: z.string().describe("The ID of the file to update"),
      newName: z.string().describe("The new name of the file"),
    }),
    handler: async (params, { step: toolStep }) => {
      const parsed = paramsSchema.safeParse(params);
      if (!parsed.success) {
        return `Error: ${parsed.error.issues[0].message}`;
      }
      const { fileId, newName } = parsed.data;

      const file = await convex.query(api.system.getFileById, {
        internalKey,
        fileId: fileId as Id<"files">,
      });

      if (!file) {
        return `Error: File with Id ${fileId} not found. Use the listFiles to get Valid fileIDs.`;
      }

      try {
        return await toolStep?.run("rename-file", async () => {
          await convex.mutation(api.system.renameFile, {
            internalKey,
            fileId: fileId as Id<"files">,
            newName,
          });

          return `File with Id ${fileId} renamed successfully.`;
        });
      } catch (error) {
        return `Error renaming file: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  });
};
