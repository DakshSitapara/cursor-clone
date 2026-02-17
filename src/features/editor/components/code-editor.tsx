import { useRef, useEffect, useMemo } from "react";

import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";

import { fullTheme, fullLightTheme } from "./extensions/theme";
import { getLanguageExtensions } from "./extensions/language-extensions";
import { minimap } from "./extensions/minimap";
import { customSetup } from "./extensions/custom-setup";
import { suggestion } from "./extensions/suggestion";
import { quickEdit } from "./extensions/quick-edit";
import { selectionTooltip } from "./extensions/selection-tooltip";
import { useTheme } from "next-themes";

interface Props {
  fileName: string;
  initialValue?: string;
  onChange: (value: string) => void;
}

export const CodeEditor = ({
  fileName,
  initialValue = "",
  onChange,
}: Props) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const { resolvedTheme } = useTheme();

  const currentTheme = useMemo(() => {
    return resolvedTheme === "dark" ? fullTheme : fullLightTheme;
  }, [resolvedTheme]);

  const languageExtensions = useMemo(() => {
    return getLanguageExtensions(fileName);
  }, [fileName]);

  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc: initialValue,
      parent: editorRef.current,
      extensions: [
        customSetup,
        currentTheme,
        languageExtensions,
        // suggestion(fileName),
        quickEdit(fileName),
        selectionTooltip(),
        keymap.of([indentWithTab]),
        minimap(),
        indentationMarkers(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
      ],
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [languageExtensions, currentTheme]);

  return <div ref={editorRef} className="size-full pl-4 bg-background" />;
};
