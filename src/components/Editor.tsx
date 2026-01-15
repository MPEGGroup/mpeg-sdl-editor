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
  LanguageSupport,
  type TagStyle,
  unfoldAll,
} from "@codemirror/language";
import { classHighlighter, highlightCode } from "@lezer/highlight";
import {
  vscodeDarkInit,
  vscodeDarkStyle,
  vscodeLightInit,
  vscodeLightStyle,
} from "@uiw/codemirror-theme-vscode";
import { EditorView } from "@codemirror/view";
import { SyntacticParseError } from "@mpeggroup/mpeg-sdl-parser";
export { ViewUpdate } from "@codemirror/view";
import { lintGutter } from "@codemirror/lint";
import { autocompletion } from "@codemirror/autocomplete";
import { sdl } from "../sdl/sdlLanguage.ts";
import { sdlLinter } from "../sdl/sdlLinter.ts";
import { ruler } from "../codemirror/ruler.ts";

type TagWithNameAndModified = {
  name: string | undefined;
  modified: Array<unknown>;
};

const darkTheme = vscodeDarkInit({ settings: { fontSize: "11px" } });
const lightTheme = vscodeLightInit({ settings: { fontSize: "11px" } });

interface EditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  onCursorChange: (position: { line: number; col: number }) => void;
  onParseErrorChange: (syntacticParseErrors: SyntacticParseError[]) => void;
  theme: "light" | "dark";
  rulerWidth: number;
  autoDisplayCompletions: boolean;
  enableLinting: boolean;
}

export interface EditorRef {
  expandAll: () => void;
  collapseAll: () => void;
  getStyledCode: () => string;
}

function extractThemeStyleAttributes(themeStyle: TagStyle[]) {
  const styleAttributesByTagName = new Map<string, string>();

  themeStyle.forEach((style: TagStyle) => {
    let attributes = "";

    Object.keys(style).forEach((key) => {
      if ((key !== "tag") && (key !== "class")) {
        const value = style[key as keyof typeof style];

        if (typeof value === "string") {
          attributes += `${key}: ${value};`;
        }
      }
    });

    if (attributes.length === 0) {
      return;
    }

    if (style.tag instanceof Array) {
      style.tag.forEach((tag) => {
        const actualTag = tag as unknown as TagWithNameAndModified;

        if (actualTag.name && (actualTag.modified.length === 0)) {
          styleAttributesByTagName.set(actualTag.name, attributes);
        }
      });
    } else {
      const actualTag = style.tag as unknown as TagWithNameAndModified;

      if (actualTag.name && (actualTag.modified.length === 0)) {
        styleAttributesByTagName.set(actualTag.name, attributes);
      }
    }
  });

  return styleAttributesByTagName;
}

const lightStyleAttributesByTagName = extractThemeStyleAttributes(
  vscodeLightStyle,
);
const darkStyleAttributesByTagName = extractThemeStyleAttributes(
  vscodeDarkStyle,
);

function getStyledCode(
  sdlLanguageSupport: LanguageSupport,
  code: string,
  theme: string,
): string {
  const styleAttributesByTagName = theme === "dark"
    ? darkStyleAttributesByTagName
    : lightStyleAttributesByTagName;

  let richText = "";

  function emitSpan(text: string, classes: string | undefined) {
    let spanStyleAttributes;

    if (classes) {
      let tagName = classes;

      if (classes?.startsWith("tok-")) {
        // If classes starts with "tok-" it is a class added by classHighlighter
        tagName = classes.substring(4);
      }

      const styleAttributes = styleAttributesByTagName.get(tagName);

      if (styleAttributes) {
        spanStyleAttributes = styleAttributes;
      }
    }

    const textNode = document.createTextNode(text);
    const p = document.createElement("p");

    p.appendChild(textNode);

    let span;
    if (spanStyleAttributes) {
      span = "<span style='" + spanStyleAttributes + "'>" +
        p.innerHTML.replaceAll(" ", "&nbsp;") +
        "</span>";
    } else {
      span = "<span>" + p.innerHTML.replaceAll(" ", "&nbsp;") + "</span>";
    }
    richText += span;
  }

  function emitBreak() {
    richText += "<br>";
  }

  highlightCode(
    code,
    sdlLanguageSupport.language.parser.parse(code),
    classHighlighter,
    emitSpan,
    emitBreak,
  );

  return `<span style="font-family: monospace">${richText}</span>`;
}

export const Editor = forwardRef<EditorRef, EditorProps>(
  (
    {
      code,
      onCodeChange,
      onCursorChange,
      onParseErrorChange,
      theme,
      rulerWidth,
      autoDisplayCompletions,
      enableLinting,
    },
    ref,
  ) => {
    const lastCursorPosition = useRef({ line: 1, col: 1 });
    const editorViewRef = useRef<EditorView | null>(null);
    const onParseErrorChangeRef = useRef(onParseErrorChange);
    onParseErrorChangeRef.current = onParseErrorChange;

    const sdlLanguageSupport = useMemo(() => sdl(), []);

    // Memoize static extensions that never change
    const staticExtensions = useMemo(() => [
      codeFolding(),
      foldGutter(),
    ], []);

    const rulerExtension = useMemo(() => ruler(rulerWidth), [rulerWidth]);

    const autocompletionExtension = useMemo(
      () => autocompletion({ activateOnTyping: autoDisplayCompletions }),
      [autoDisplayCompletions],
    );

    const stableOnParseErrorChange = useCallback(
      (errors: SyntacticParseError[]) => {
        onParseErrorChangeRef.current(errors);
      },
      [],
    );

    // Memoize dynamic extensions that depend on props
    const dynamicExtensions = useMemo(
      () =>
        enableLinting
          ? [
            lintGutter(),
            sdlLinter({ onParseErrorChange: stableOnParseErrorChange }),
          ]
          : [],
      [enableLinting, stableOnParseErrorChange],
    );

    const extensions = useMemo(() => [
      ...staticExtensions,
      rulerExtension,
      autocompletionExtension,
      sdlLanguageSupport,
      ...dynamicExtensions,
    ], [
      staticExtensions,
      rulerExtension,
      autocompletionExtension,
      sdlLanguageSupport,
      dynamicExtensions,
    ]);

    // Memoize imperative methods
    const expandAll = useCallback(() => {
      if (editorViewRef.current) {
        const view = editorViewRef.current;
        const state = view.state;

        view.dispatch({});

        ensureSyntaxTree(view.state, state.doc.length, 5000);

        unfoldAll(view);
      }
    }, []);

    const collapseAll = useCallback(() => {
      if (editorViewRef.current) {
        const view = editorViewRef.current;
        const state = view.state;

        view.dispatch({});

        ensureSyntaxTree(view.state, state.doc.length, 5000);

        foldAll(view);
      }
    }, []);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      expandAll,
      collapseAll,
      getStyledCode: () => {
        return getStyledCode(sdlLanguageSupport, code, theme);
      },
    }), [expandAll, collapseAll, sdlLanguageSupport, code, theme]);

    const onInternalCodeChange = useCallback((newCode: string) => {
      onCodeChange(newCode);
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
          value={code}
          theme={theme === "dark" ? darkTheme : lightTheme}
          width="100%"
          height="100%"
          className="h-full w-full border border-base-300 rounded-md"
          onChange={onInternalCodeChange}
          onUpdate={onViewUpdate}
          onCreateEditor={(view) => {
            editorViewRef.current = view;
          }}
          indentWithTab
          extensions={extensions}
          basicSetup={{
            lineNumbers: true,
            syntaxHighlighting: true,
            history: true,
            bracketMatching: true,
            closeBrackets: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            autocompletion: false,
            defaultKeymap: true,
            searchKeymap: false,
            historyKeymap: true,
            foldGutter: false,
            closeBracketsKeymap: false,
            foldKeymap: false,
            completionKeymap: true,
          }}
        />
      </div>
    );
  },
);
