import { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { ChevronRightIcon } from "lucide-react";
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils";

import { cn } from "@/lib/utils";

import { 
    useFolderContents, 
    useCreateFolder, 
    useCreateFile,
    useRenameFile,
    useDeleteFile
} from "@/features/projects/hooks/use-files";

import { getItemPadding } from "./constants";
import { LoadingRow } from "./loading-row";
import { CreateInput } from "./create-input";
import { useState } from "react";
import { TreeItemWrapper } from "./tree-item-wrapper";
import { RenameInput } from "./rename-input";
import { useEditor } from "@/features/editor/hooks/use-editor";

export const Tree = ({
    item,
    level,
    projectId
}:{
    item: Doc<"files">;
    level: number;
    projectId: Id<"projects">
}) => {

    const [isOpen, setIsOpen] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [creating, setCreating] = useState<"file" | "folder" | null>(null);

    const { openFile, closeTab, activeTabId } = useEditor(projectId);

    const renameFile = useRenameFile();
    const deleteFile = useDeleteFile();
    const createFile = useCreateFile();
    const createFolder = useCreateFolder();

    const folderContents = useFolderContents({
        projectId,
        parentId: item._id,
        enabled: item.type === "folder" && isOpen,
    })

    const startCreating = (type: "file" | "folder") => {
        setIsOpen(true);
        setCreating(type);
    }

    const handleCreate = (name: string) => {
        setCreating(null);

        if (creating === "file") {
            createFile({
                name,
                projectId,
                content: "",
                parentId: item._id,
            });
        } else if (creating === "folder") {
            createFolder({
                name,
                projectId,
                parentId: item._id,
            });
        }
    };

    const handleRename = (newName: string) => {
        setIsRenaming(false);

        if(newName === item.name) {
            return;
        };

        renameFile({ id: item._id, newName });
    }


    if(item.type === "file"){

        const fileName = item.name;

        const isActive = activeTabId === item._id;

        if (isRenaming) {
            return (
                <RenameInput 
                    type="file"
                    defaultValue={fileName}
                    level={level}
                    onSubmit={handleRename}
                    onCancel={() => setIsRenaming(false)}
                />
            );
        }

        return (
            <TreeItemWrapper 
                item={item}
                level={level}
                isActive={isActive}
                onClick={() => openFile(item._id, { pinned: false })}
                onDoubleClick={() => openFile(item._id, { pinned: true })}
                onRename={() => setIsRenaming(true)}
                onDelete={() => {
                    closeTab(item._id);
                    deleteFile({ id: item._id });
                }}
            >
                <FileIcon fileName={fileName} autoAssign className="size-4" />
                <span className="text-sm truncate">
                    {fileName}
                </span>
            </TreeItemWrapper>
        )
    }

    const folderName = item.name

    const folderContent = (
        <>
        <div className="flex items-center gap-0.5">
            <ChevronRightIcon className={cn("size-4 shrink-0 text-muted-foreground", isOpen && "rotate-90")} />
            <FolderIcon folderName={folderName} className="size-4" />
        </div>
            <span className="text-sm truncate">
                {folderName}
            </span>
        </>
    ) ;

    if(creating){
        return (
            <>
            <button
                onClick={() => setIsOpen((perv) => !perv)}
                className="group flex items-center gap-1 h-5.5 w-full hover:bg-accent/30"
                style={{ paddingLeft: getItemPadding(level, false) }}
            >
                {folderContent}
            </button>
            {isOpen && 
            <>
                {folderContents === undefined && <LoadingRow level={level + 1} />}
                <CreateInput 
                    type={creating}
                    level={level}
                    onSubmit={handleCreate}
                    onCancel={() => setCreating(null)}
                />
            </>
            }
            {folderContents?.map((file) => 
                <Tree 
                    key={file._id} 
                    item={file} 
                    level={level + 1} 
                    projectId={projectId}
                />
            )}
            </>
        )
    }

    if(isRenaming){
        return (
            <>
            <RenameInput 
                type="folder"
                defaultValue={folderName}
                level={level}
                onSubmit={handleRename}
                onCancel={() => setIsRenaming(false)}
            />
            {isOpen && 
            <>
                {folderContents === undefined && <LoadingRow level={level + 1} />}
            </>
            }
            {folderContents?.map((file) => 
                <Tree 
                    key={file._id} 
                    item={file} 
                    level={level + 1} 
                    projectId={projectId}
                />
            )}
            </>
        )
    }

    return (
        <>
        <TreeItemWrapper 
            item={item}
            level={level}
            isActive={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
            onDoubleClick={() => {}}
            onRename={() => setIsRenaming(true)}
            onDelete={() => deleteFile({ id: item._id })}
            onCreateFile={() => startCreating("file")}
            onCreateFolder={() => startCreating("folder")}
        >
            {folderContent}
           </TreeItemWrapper>
           {isOpen && (
            <>
            {folderContents === undefined && <LoadingRow level={level + 1} />}
            {folderContents?.map((file) => 
                <Tree 
                    key={file._id} 
                    item={file} 
                    level={level + 1} 
                    projectId={projectId}
                />
            )}
            </>
           )}
        </>
    )
}