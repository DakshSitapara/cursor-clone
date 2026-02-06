"use client";

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Poppins } from "next/font/google"
import { CloudCheckIcon, LoaderIcon } from "lucide-react";

import { Id } from "../../../../convex/_generated/dataModel"

import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { UserButton } from "@clerk/nextjs"
import { useProject, useRenameProject } from "@/hooks/use-projects"

import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns";

const font = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export const Navbar = ({ 
    projectId
 }: { 
    projectId: Id<"projects"> 
}) => {

    const project = useProject(projectId);

    const renameProject = useRenameProject(projectId);

    const [isRenaming, setIsRenaming] = useState(false);
    const [name, setName] = useState("");

    const handelRenameStart = () => {
        
        if(!project) return;
        
        setName(project.name);
        setIsRenaming(true);
    
    }

    const handleSubmit = () => {
        
        if(!project) return;
        
        setIsRenaming(false);

        const trimmedName = name.trim();

        if(!trimmedName && trimmedName === project.name) return;

            renameProject({ id: projectId, name: trimmedName });
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {

        if(event.key === "Enter") {
            handleSubmit();
        }else if(event.key === "Escape") {
            setIsRenaming(false);
        }
    }

    return (
        <div className="flex justify-between items-center gap-x-2 p-2 bg-sidebar border-b">
            <div className="flex items-center gap-x-2">
                <Breadcrumb>
                    <BreadcrumbList className="gap-0!">
                        <BreadcrumbItem>
                            <BreadcrumbLink
                                asChild
                                className="flex items-center gap-1.5"
                            >
                                <Button
                                    variant="ghost"
                                    asChild
                                    className="w-fit! p-1.5! h-7"
                                >
                                    <Link href="/">
                                        <Image src="/logo.svg" alt="logo" className="hidden dark:block" width={20} height={20} />
                                        <Image src="/logo-alt.svg" alt="logo" className="block dark:hidden" width={20} height={20} />
                                        <span className={cn("text-sm font-medium", font.className)}>Cursor Clone</span>
                                    </Link>
                                </Button>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="mr-1 ml-0!" />
                        <BreadcrumbItem>
                            {isRenaming ? (
                                <input 
                                    autoFocus
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onFocus={(e) => e.target.select()}
                                    onBlur={handleSubmit}
                                    onKeyDown={handleKeyDown}
                                    className="text-sm bg-transparent text-foreground outline-none focus:ring-1 focus:ring-inset focus:ring-ring font-medium max-w-40 truncate"
                                />
                            ) : (
                            <BreadcrumbPage
                                onClick={handelRenameStart}
                                className="text-sm cursor-pointer hover:text-primary font-medium max-w-40 truncate"
                            >
                                {project?.name ?? "Loading..."}
                            </BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                {project?.importStatus === "importing" ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <LoaderIcon className="size-4 text-muted-foreground animate-spin" />
                        </TooltipTrigger>
                        <TooltipContent>Importing...</TooltipContent>
                    </Tooltip>
                ) : (

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <CloudCheckIcon className="size-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                Save {" "}
                                {project?.updatedAt ? formatDistanceToNow(project.updatedAt, { addSuffix: true }) : "Loading..."}
                            </TooltipContent>
                        </Tooltip>
                )}
            </div>
            <div className="flex items-center gap-2">
                <UserButton />
            </div>
        </div>
    )
}