import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils"
import { useState } from "react";
import { getItemPadding } from "./constants";

export const RenameInput = ({
    type,
    defaultValue,
    isOpen,
    level,
    onSubmit,
    onCancel,
}:{
    type: "file" | "folder";
    defaultValue: string;
    isOpen?: boolean;
    level: number;
    onSubmit: (name: string) => void;
    onCancel: () => void;
}) => {

    const [value, setValue] = useState(defaultValue)

    const handleSubmit = () => {
        const trimmedValue = value.trim() || defaultValue;
            onSubmit(trimmedValue);
    }
    
    return (
        <div 
            className="w-full flex items-center gap-1 h-5.5 bg-accent/30"
            style={{ paddingLeft: getItemPadding(level, type === "file") }}
            >
            <div className="flex items-center gap-0.5">
                {type === "folder" && (
                    <ChevronRightIcon className={cn("size-4 text-muted-foreground shrink-0", isOpen && "rotate-90")} />
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
                    onFocus={(e) => {
                        if(type === "folder"){
                            e.currentTarget.select();
                        }else {
                            const value = e.currentTarget.value;
                            const lastdotIndex = value.lastIndexOf(".");
                            if(lastdotIndex > 0){
                                e.currentTarget.setSelectionRange(0, lastdotIndex);
                            }else{
                                e.currentTarget.select();
                            }
                        }
                    }}
                />
        </div>
    );
};