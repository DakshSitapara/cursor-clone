import { FileSystemTree } from "@webcontainer/api";

import { Doc, Id } from "../../../../convex/_generated/dataModel";

type FileDoc = Doc<"files">;

export const buildFileTree = (files: FileDoc[]): FileSystemTree => {
  const tree: FileSystemTree = {};
  const filesMap = new Map(files.map((file) => [file._id, file]));

  const getPath = (file: FileDoc): string[] => {
    const parts: string[] = [file.name];
    let parentId = file.parentId;
    while (parentId) {
      const parent = filesMap.get(parentId);
      if (parent) {
        parts.unshift(parent.name);
        parentId = parent.parentId;
      } else {
        break;
      }
    }
    return parts;
  };

  for (const file of files) {
    const pathParts = getPath(file);
    let current = tree;

    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!current[part]) {
        current[part] = { directory: {} };
      }
      const node = current[part];
      if ("directory" in node) {
        current = node.directory;
      }
    }

    const lastPart = pathParts[pathParts.length - 1];
    if (file.type === "folder") {
      current[lastPart] = { directory: {} };
    } else {
      current[lastPart] = { file: { contents: file.content ?? "" } };
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
