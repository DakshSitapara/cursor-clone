import { z } from "zod";
import { createTool } from "@inngest/agent-kit";

import { convex } from "@/lib/convex-client";

import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

interface DeleteFilesToolOptions {
  internalKey: string;
}

const paramsSchema = z.object({
  fileIds: z
    .array(z.string().min(1, "File ID cannot be empty"))
    .min(1, "Provide at least one file ID"),
});

export const createDeleteFilesTool = ({
  internalKey,
}: DeleteFilesToolOptions) => {
  return createTool({
    name: "delete-files",
    description:
      "Deletes files or folders from project. If deleting a folder, it will be deleted recursively and all its contents.",
    parameters: z.object({
      fileIds: z
        .array(z.string())
        .describe("Array of file or folder IDs to delete"),
    }),
    handler: async (params, { step: toolStep }) => {
      const parsed = paramsSchema.safeParse(params);
      if (!parsed.success) {
        return `Error: ${parsed.error.issues[0].message}`;
      }
      const { fileIds } = parsed.data;

      const filesToDelete: { id: string; name: string; type: string }[] = [];

      for (const fileId of fileIds) {
        const file = await convex.query(api.system.getFileById, {
          internalKey,
          fileId: fileId as Id<"files">,
        });
        if (!file) {
          return `Error: File with Id ${fileId} not found. Use the listFiles to get Valid fileIDs.`;
        }
        filesToDelete.push({
          id: file._id,
          name: file.name,
          type: file.type,
        });
      }

      try {
        return await toolStep?.run("delete-files", async () => {
          const results: string[] = [];
          for (const file of filesToDelete) {
            await convex.mutation(api.system.deleteFile, {
              internalKey,
              fileId: file.id as Id<"files">,
            });
            results.push(`File ${file.name} "${file.type}" deleted successfully.`);
          }
          return results.join("\n");
        });
      } catch (error) {
        return `Error deleting files: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  });
};
