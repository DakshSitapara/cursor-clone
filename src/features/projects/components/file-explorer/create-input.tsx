import { ChevronRightIcon } from "lucide-react";
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils"
import { useState } from "react";
import { getItemPadding } from "./constants";

export const CreateInput = ({
    type,
    level,
    onSubmit,
    onCancel,
}:{
    type: "file" | "folder";
    level: number;
    onSubmit: (name: string) => void;
    onCancel: () => void;
}) => {

    const [value, setValue] = useState("")

    const handleSubmit = () => {
        const trimmedValue = value.trim();
        if(trimmedValue){
            onSubmit(trimmedValue);
        }else{
            onCancel();
        }
    }
    
    return (
        <div 
            className="w-full flex items-center gap-1 h-5.5 bg-accent/30"
            style={{ paddingLeft: getItemPadding(level, type === "file") }}
            >
            <div className="flex items-center gap-0.5">
                {type === "folder" && (
                    <ChevronRightIcon className="size-4 text-muted-foreground shrink-0" />
                )}
                {type === "file" && (
                    <FileIcon fileName={value} className="size-4" autoAssign />
                )}
                {type === "folder" && (
                    <FolderIcon folderName={value} className="size-4" />
                )}
            </div>
                <input
                    autoFocus
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none focus:right-1 focus:ring-inset focus:ring-ring"
                    onBlur={handleSubmit}
                    onKeyDown={(e) => {
                        if(e.key === "Enter"){
                            handleSubmit();
                        }else if(e.key === "Escape"){
                            onCancel();
                        }
                    }}
                />
        </div>
    );
};