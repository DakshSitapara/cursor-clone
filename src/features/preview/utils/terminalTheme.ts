"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";

export const useTerminalTheme = () => {
  const { resolvedTheme } = useTheme();

  const theme = useMemo(() => {
    if (resolvedTheme === "dark") {
      return {
        background: "#000000",
        foreground: "#c0caf5",
        cursor: "#c0caf5",
        selectionBackground: "#515c7e66",

        black: "#363b54",
        red: "#f7768e",
        green: "#41a6b5",
        yellow: "#e0af68",
        blue: "#7aa2f7",
        magenta: "#bb9af7",
        cyan: "#7dcfff",
        white: "#787c99",

        brightBlack: "#444b6a",
        brightRed: "#f7768e",
        brightGreen: "#41a6b5",
        brightYellow: "#e0af68",
        brightBlue: "#7aa2f7",
        brightMagenta: "#bb9af7",
        brightCyan: "#7dcfff",
        brightWhite: "#acb0d0",
      };
    }

    return {
      background: "#ffffff",
      foreground: "#3760bf",
      cursor: "#3760bf",
      selectionBackground: "#b6d5ff66",

      black: "#000000",
      red: "#c64343",
      green: "#587539",
      yellow: "#965027",
      blue: "#2e7de9",
      magenta: "#7847bd",
      cyan: "#007197",
      white: "#3760bf",

      brightBlack: "#666666",
      brightRed: "#c64343",
      brightGreen: "#587539",
      brightYellow: "#965027",
      brightBlue: "#2e7de9",
      brightMagenta: "#7847bd",
      brightCyan: "#007197",
      brightWhite: "#000000",
    };
  }, [resolvedTheme]);

  return theme;
};
