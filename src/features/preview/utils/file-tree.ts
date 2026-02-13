import { FileSystemTree } from "@webcontainer/api";

import { Doc, Id } from "../../../../convex/_generated/dataModel";

type FileDoc = Doc<"files">;

export const buildFileTree = (files: FileDoc[]): FileSystemTree => {
  const tree: FileSystemTree = {};
  const filesMap = new Map(files.map((file) => [file._id, file]));

  const getPath = (files: FileDoc): string[] => {
    const parts: string[] = [files.name];
    let parentId = files.parentId;
    while (parentId) {
      const parent = filesMap.get(parentId);
      if (parent) {
        parts.unshift(parent.name);
        parentId = parent.parentId;
      }
    }
    return parts;
  };

  for (const file of files) {
    const pathParts = getPath(file);
    let current = tree;
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const isLast = i === pathParts.length - 1;
      if (isLast) {
        if (file.type === "folder") {
          current[part] = { directory: {} };
        } else if (!file.storageId && file.content !== undefined) {
          current[part] = { file: { contents: file.content } };
        } else {
          if (!current[part]) {
            current[part] = { directory: {} };
          }
          const node = current[part];
          if ("directory" in node) {
            current = node.directory;
          }
        }
      }
    }
  }

  return tree;
};

export const getFilePath = (
  file: FileDoc,
  filesMap: Map<Id<"files">, FileDoc>,
): string => {
  const parts: string[] = [file.name];
  let parentId = file.parentId;
  while (parentId) {
    const parent = filesMap.get(parentId);
    if (!parent) break;
    parts.unshift(parent.name);
    parentId = parent.parentId;
  }
  return parts.join("/");
};
