import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

export const tokyoNightTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#0a0a0d",
      color: "#a9b1d6",
      height: "100%",
      fontFamily: "var(--font-plex-mono), monospace",
    },

    ".cm-content": {
      caretColor: "#c0caf5",
      fontSize: "14px",
    },

    ".cm-cursor": {
      borderLeftColor: "#c0caf5",
    },

    ".cm-selectionBackground, ::selection": {
      backgroundColor: "#515c7e40 !important",
    },

    ".cm-activeLine": {
      backgroundColor: "#1e202e",
    },

    ".cm-gutters": {
      backgroundColor: "#0a0a0d",
      color: "#363b54",
      border: "none",
    },

    ".cm-activeLineGutter": {
      color: "#737aa2",
    },

    ".cm-tooltip": {
      backgroundColor: "#08080b",
      border: "1px solid #101014",
      color: "#a9b1d6",
    },

    ".cm-panels": {
      backgroundColor: "#08080b",
      borderBottom: "1px solid #101014",
    },

    ".cm-matchingBracket": {
      backgroundColor: "#08080b",
      outline: "1px solid #42465d",
    },

    ".cm-minimap": {
      backgroundColor: "#0a0a0d",
      borderLeft: "1px solid #101014",
    },

    ".cm-minimap canvas": {
      backgroundColor: "#0a0a0d",
    },
  },
  { dark: true },
);

export const tokyoNightHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: "#bb9af7" },
  { tag: tags.string, color: "#85d0b7" },
  { tag: tags.number, color: "#c0768e" },
  { tag: tags.bool, color: "#c0768e" },
  { tag: tags.comment, color: "#444b6a", fontStyle: "italic" },
  { tag: tags.variableName, color: "#c0caf5" },
  { tag: tags.function(tags.variableName), color: "#7aa2f7" },
  { tag: tags.typeName, color: "#0db9d7" },
  { tag: tags.className, color: "#c0caf5" },
  { tag: tags.propertyName, color: "#7dcfff" },
  { tag: tags.operator, color: "#89ddff" },
  { tag: tags.tagName, color: "#f7768e" },
  { tag: tags.attributeName, color: "#bb9af7" },
  { tag: tags.bracket, color: "#9abdf5" },
  { tag: tags.angleBracket, color: "#ba3c97" },
]);

export const fullTheme = [
  tokyoNightTheme,
  syntaxHighlighting(tokyoNightHighlight),
];

export const tokyoLightTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#ffffff",
      color: "#3760bf",
      height: "100%",
      fontFamily: "var(--font-plex-mono), monospace",
    },

    ".cm-content": {
      caretColor: "#3760bf",
      fontSize: "14px",
    },

    ".cm-cursor": {
      borderLeftColor: "#3760bf",
    },

    ".cm-selectionBackground, ::selection": {
      backgroundColor: "#b6d5ff66 !important",
    },

    ".cm-activeLine": {
      backgroundColor: "#f2f6ff",
    },

    ".cm-gutters": {
      backgroundColor: "#f7f9ff",
      color: "#9aa5ce",
      border: "none",
    },

    ".cm-activeLineGutter": {
      color: "#3760bf",
    },

    ".cm-tooltip": {
      backgroundColor: "#ffffff",
      border: "1px solid #d0d7ff",
      color: "#3760bf",
    },

    ".cm-panels": {
      backgroundColor: "#ffffff",
      borderBottom: "1px solid #d0d7ff",
    },

    ".cm-matchingBracket": {
      backgroundColor: "#cce2ff",
      outline: "1px solid #7aa2f7",
    },

    ".cm-minimap": {
      backgroundColor: "#ffffff",
      borderLeft: "1px solid #e5e9ff",
    },

    ".cm-minimap canvas": {
      backgroundColor: "#ffffff",
    },
  },
  { dark: false },
);

export const tokyoLightHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: "#7847bd" },
  { tag: tags.string, color: "#587539" },
  { tag: tags.number, color: "#965027" },
  { tag: tags.bool, color: "#965027" },
  { tag: tags.comment, color: "#9699a3", fontStyle: "italic" },
  { tag: tags.variableName, color: "#3760bf" },
  { tag: tags.function(tags.variableName), color: "#2e7de9" },
  { tag: tags.typeName, color: "#007197" },
  { tag: tags.className, color: "#007197" },
  { tag: tags.propertyName, color: "#2e7de9" },
  { tag: tags.operator, color: "#3760bf" },
  { tag: tags.tagName, color: "#c64343" },
  { tag: tags.attributeName, color: "#7847bd" },
  { tag: tags.bracket, color: "#3760bf" },
  { tag: tags.angleBracket, color: "#3760bf" },
]);

export const fullLightTheme = [
  tokyoLightTheme,
  syntaxHighlighting(tokyoLightHighlight),
];
