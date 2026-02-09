import { useCallback } from "react";
import { useEditorStore } from "../store/use-editor-store";
import { Id } from "../../../../convex/_generated/dataModel";

export const useEditor = (projectId: Id<"projects">) => {
    const store = useEditorStore();
    const tabState = useEditorStore((state) => state.getTabState(projectId));

    const openFile = useCallback((fileId: Id<"files">, options: { pinned: boolean }) => {
        store.openFile(projectId, fileId, options);
    }, [projectId, store]);

    const closeTab = useCallback((fileId: Id<"files">) => {
        store.closeTab(projectId, fileId);
    }, [projectId, store]);

    const closeAllTabs = useCallback(() => {
        store.closeAllTabs(projectId);
    }, [projectId, store]);

    const setActiveTab = useCallback((fileId: Id<"files">) => {
        store.setActiveTab(projectId, fileId);
    }, [projectId, store]);

    return {
        openTabs: tabState.openTabs,
        previewTabId: tabState.previewTabId,
        activeTabId: tabState.activeTabId,
        openFile,
        closeTab,
        closeAllTabs,
        setActiveTab,
    }
}