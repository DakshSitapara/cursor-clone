import { z } from "zod";
import { createTool } from "@inngest/agent-kit";

import { convex } from "@/lib/convex-client";

import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

interface UpdateFileToolOptions {
  internalKey: string;
}

const paramsSchema = z.object({
  fileId: z.string().min(1, "File Id is required"),
  content: z.string(),
});

export const createUpdateFileTool = ({
  internalKey,
}: UpdateFileToolOptions) => {
  return createTool({
    name: "update-file",
    description:
      "Updates the contents of file form project. Return file contensts",
    parameters: z.object({
      fileId: z.string().describe("The ID of the file to update"),
      content: z.string().describe("The new content of the file"),
    }),
    handler: async (params, { step: toolStep }) => {
      const parsed = paramsSchema.safeParse(params);
      if (!parsed.success) {
        return `Error: ${parsed.error.issues[0].message}`;
      }
      const { fileId, content } = parsed.data;

      const file = await convex.query(api.system.getFileById, {
        internalKey,
        fileId: fileId as Id<"files">,
      });

      if (!file) {
        return `Error: File with Id ${fileId} not found. Use the listFiles to get Valid fileIDs.`;
      }

      if (file.type === "folder") {
        return `Error: File with Id ${fileId} is a folder, not a file. You can only update file contents.`;
      }

      try {
        return await toolStep?.run("update-file", async () => {
          await convex.mutation(api.system.updateFile, {
            internalKey,
            fileId: fileId as Id<"files">,
            content,
          });

          return `File with Id ${fileId} updated successfully.`;
        });
      } catch (error) {
        return `Error updating file: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  });
};
