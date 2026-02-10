import { showMinimap } from "@replit/codemirror-minimap";

const createMinimap = () => {
    const dom = document.createElement("div");
    return { dom };
};

export const minimap = () => {
    return showMinimap.compute(["doc"], () => {
        return {
            create: createMinimap,
        };
    });
};
