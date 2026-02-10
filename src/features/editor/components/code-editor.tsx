import { useRef, useEffect, useMemo } from "react";

import { EditorView, keymap } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { indentWithTab } from "@codemirror/commands";
import { indentationMarkers} from "@replit/codemirror-indentation-markers"

import { customTheme } from "./extensions/theme";
import { getLanguageExtensions } from "./extensions/language-extensions";
import { minimap } from "./extensions/minimap";
import { customSetup } from "./extensions/custom-setup";

interface Props {
    fileName: string;
    initialValue?: string;
    onChange: (value: string) => void;
}

export const CodeEditor = ({ 
    fileName, 
    initialValue = "", 
    onChange 
}: Props) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const languageExtensions = useMemo(() => {
    return getLanguageExtensions(fileName);
  }, [fileName]);

  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc:initialValue,
      parent: editorRef.current,
      extensions: [
        languageExtensions,
        customTheme,
        oneDark,
        keymap.of([ indentWithTab]),
        minimap(),
        indentationMarkers(),
        customSetup,
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
  }, [languageExtensions]);

  return <div ref={editorRef} className="size-full pl-4 bg-background" />;
};
