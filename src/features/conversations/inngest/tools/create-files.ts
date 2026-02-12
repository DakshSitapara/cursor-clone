import { z } from "zod";
import { createTool } from "@inngest/agent-kit";

import { convex } from "@/lib/convex-client";

import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

interface CreateFilesToolOptions {
  internalKey: string;
  projectId: Id<"projects">;
}

const paramsSchema = z.object({
  parentId: z.string(),
  files: z
    .array(
      z.object({
        name: z.string().min(1, "File name cannot be empty"),
        content: z.string(),
      }),
    )
    .min(1, "Provide at least one file to create"),
});

export const createCreateFilesTool = ({
  projectId,
  internalKey,
}: CreateFilesToolOptions) => {
  return createTool({
    name: "create-files",
    description:
      "Creates multiple files at ones in the same folder. Use this to batch create files that share same parent folder. More efficient than creating files one by one.",
    parameters: z.object({
      parentId: z
        .string()
        .describe(
          "The ID of the parent folder. Use empty string to create files at root level. Must be a valid folder ID from listFiles tool.",
        ),
      files: z
        .array(
          z.object({
            name: z.string().describe("File name including extension"),
            content: z.string().describe("The content of the file"),
          }),
        )
        .describe("Array of files to create"),
    }),
    handler: async (params, { step: toolStep }) => {
      const parsed = paramsSchema.safeParse(params);
      if (!parsed.success) {
        return `Error: ${parsed.error.issues[0].message}`;
      }
      const { parentId, files } = parsed.data;

      try {
        return await toolStep?.run("create-files", async () => {
          let resolvedParentId: Id<"files"> | undefined;
          if (parentId && parentId !== "") {
            try {
              resolvedParentId = parentId as Id<"files">;
              const parentFolder = await convex.query(api.system.getFileById, {
                internalKey,
                fileId: resolvedParentId,
              });
              if (!parentFolder) {
                return `Error: Parent folder with Id ${parentId} not found. Use the listFiles to get Valid folderIDs.`;
              }
              if (parentFolder.type !== "folder") {
                return `Error: Parent folder with Id ${parentId} is not a folder. Use folderIDs as parentId to create files under folder.`;
              }
            } catch {
              return `Error: Parent folder with Id ${parentId} not found. Use the listFiles to get Valid folderIDs or Use empty string to create files at root level.`;
            }
          }

          const results = await convex.mutation(api.system.createFiles, {
            internalKey,
            projectId,
            parentId: resolvedParentId,
            files,
          });

          const created = results.filter((result) => !result.error);
          const failed = results.filter((result) => result.error);

          let response = `Successfully created ${created.length} file(s).`;
          if (created.length > 0) {
            response += `: ${created.map((file) => file.name).join(", ")}`;
          }
          if (failed.length > 0) {
            response += `Failed : ${failed.map((file) => `${file.name} - (${file.error})`).join(", ")} file(s).`;
          }

          return response;
        });
      } catch (error) {
        return `Error creating files: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  });
};
