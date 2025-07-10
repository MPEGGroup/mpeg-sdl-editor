import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import CodeMirror, { ViewUpdate } from "@uiw/react-codemirror";
import {
  codeFolding,
  ensureSyntaxTree,
  foldAll,
  foldGutter,
  unfoldAll,
} from "@codemirror/language";
import { vscodeDarkInit, vscodeLightInit } from "@uiw/codemirror-theme-vscode";
import { EditorView } from "@codemirror/view";
import { SyntacticParseError } from "@mpeggroup/mpeg-sdl-parser";
export { ViewUpdate } from "@codemirror/view";
import { lintGutter } from "@codemirror/lint";
import { sdl } from "../sdl/sdlLanguage";
import { sdlLinter } from "../sdl/sdlLinter";
import { ruler } from "../codemirror/ruler";

const darkTheme = vscodeDarkInit({ settings: { fontSize: "11px" } });
const lightTheme = vscodeLightInit({ settings: { fontSize: "11px" } });

interface EditorProps {
  value: string;
  onCodeChange: (value: string) => void;
  onCursorChange: (position: { line: number; col: number }) => void;
  onParseErrorChange: (syntacticParseErrors: SyntacticParseError[]) => void;
  theme: "light" | "dark";
}

export interface EditorRef {
  expandAll: () => void;
  collapseAll: () => void;
}

export const Editor = forwardRef<EditorRef, EditorProps>(
  ({ value, onCodeChange, onCursorChange, onParseErrorChange, theme }, ref) => {
    const lastCursorPosition = useRef({ line: 1, col: 1 });
    const editorViewRef = useRef<EditorView | null>(null);

    const extensions = useMemo(() => {
      const ext = [
        codeFolding(),
        foldGutter(),
        sdl(),
        sdlLinter({ onParseErrorChange }),
        lintGutter(),
        ruler(80),
      ];
      return ext;
    }, [onParseErrorChange]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      expandAll: () => {
        if (editorViewRef.current) {
          const view = editorViewRef.current;
          const state = view.state;

          view.dispatch({});

          ensureSyntaxTree(view.state, state.doc.length, 5000);

          unfoldAll(view);
        }
      },
      collapseAll: () => {
        if (editorViewRef.current) {
          const view = editorViewRef.current;
          const state = view.state;

          view.dispatch({});

          ensureSyntaxTree(view.state, state.doc.length, 5000);

          foldAll(view);
        }
      },
    }), []);

    const onInternalCodeChange = useCallback((val: string) => {
      onCodeChange(val);
    }, [onCodeChange]);

    const onViewUpdate = useCallback((viewUpdate: ViewUpdate) => {
      if (viewUpdate.state) {
        const state = viewUpdate.state;
        const selection = state.selection.main;

        if (selection) {
          const head = selection.head;
          const line = state.doc.lineAt(head);
          const lineNumber = line.number;
          const columnNumber = head - line.from + 1;

          // Only update if position actually changed
          if (
            lastCursorPosition.current.line !== lineNumber ||
            lastCursorPosition.current.col !== columnNumber
          ) {
            const newPosition = { line: lineNumber, col: columnNumber };
            lastCursorPosition.current = newPosition;
            onCursorChange(newPosition);
          }
        }
      }
    }, [onCursorChange]);

    return (
      <div className="h-full w-full">
        <CodeMirror
          value={value}
          theme={theme === "dark" ? darkTheme : lightTheme}
          width="100%"
          height="100%"
          className="h-full w-full border border-base-300 rounded-md"
          onChange={onInternalCodeChange}
          onUpdate={onViewUpdate}
          onCreateEditor={(view) => {
            editorViewRef.current = view;
          }}
          extensions={extensions}
          basicSetup={{
            lineNumbers: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            autocompletion: true,
            defaultKeymap: false,
            searchKeymap: false,
            historyKeymap: false,
            foldGutter: false,
            closeBracketsKeymap: false,
            foldKeymap: false,
            completionKeymap: false,
          }}
        />
      </div>
    );
  },
);
