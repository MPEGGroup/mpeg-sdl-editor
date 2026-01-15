import { SyntacticParseError } from "@mpeggroup/mpeg-sdl-parser";
import { Editor } from "./components/Editor.tsx";
import type { EditorRef } from "./components/Editor.tsx";
import { Navbar } from "./components/Navbar.tsx";
import { SubNav } from "./components/SubNav.tsx";
import { Settings } from "./components/Settings.tsx";
import { StatusBar } from "./components/StatusBar.tsx";
import { ResizableLayout } from "./components/ResizableLayout.tsx";
import { useToast } from "./hooks/useToast.ts";
import { useFileOperations } from "./hooks/useFileOperations.ts";
import { useTheme } from "./hooks/useTheme.ts";
import { usePrettier } from "./hooks/usePrettier.ts";
import { useRulerWidth } from "./hooks/useRulerWidth.ts";
import { useAutoDisplayCompletions } from "./hooks/useAutoDisplayCompletions.ts";
import { useEnableLinting } from "./hooks/useEnableLinting.ts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMobileDetection } from "./hooks/useMobileDetection.ts";

function getInitialCodeFromHash(): string | null {
  const hash = globalThis.location.hash;
  if (hash.startsWith("#c=")) {
    try {
      return atob(hash.slice(3));
    } catch {
      return null;
    }
  }
  return null;
}

export function App() {
  const defaultCode =
    "// Start typing your SDL here... <Ctrl+Space> for completions\n";

  const [code, setCodeInternal] = useState<string>(
    () => getInitialCodeFromHash() ?? defaultCode,
  );

  const setCode = useCallback((newCode: string) => {
    setCodeInternal(newCode);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hashCode = getInitialCodeFromHash();
      if (hashCode !== null) {
        setCode(hashCode);
      }
    };
    globalThis.addEventListener("hashchange", handleHashChange);
    return () => globalThis.removeEventListener("hashchange", handleHashChange);
  }, []);
  const [toastState, showToast] = useToast();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useMobileDetection();
  const [isSettingsShown, setSettingsShown] = useState(false);
  const { rulerWidth, setRulerWidth } = useRulerWidth();
  const { autoDisplayCompletions, setAutoDisplayCompletions } =
    useAutoDisplayCompletions();
  const { enableLinting, setEnableLinting } = useEnableLinting();
  const [cursorPosition, setCursorPosition] = useState<
    { line: number; col: number }
  >({ line: 1, col: 1 });
  const editorRef = useRef<EditorRef>(null);

  const onCursorChange = useCallback(
    (position: { line: number; col: number }) => {
      setCursorPosition((prev) => {
        // Only update if position actually changed
        if (prev.line !== position.line || prev.col !== position.col) {
          return position;
        }
        return prev;
      });
    },
    [],
  );
  const handleShare = useCallback(async () => {
    const encoded = btoa(code);
    const url =
      `${globalThis.location.origin}${globalThis.location.pathname}#c=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("URL copied!");
    } catch {
      showToast("Failed to copy URL", "error");
    }
  }, [code, showToast]);

  const {
    handleSave,
    handleLoad,
    handleCopy,
  } = useFileOperations({
    code,
    setCode,
    showToast,
    editorRef,
  });

  const lineCount = useMemo(() => code.split("\n").length, [code]);
  const characterCount = useMemo(() => code.length, [code]);
  const [syntacticParseErrors, setSyntacticParseErrors] = useState<
    SyntacticParseError[]
  >([]);

  const onParseErrorChange = useCallback((newErrors: SyntacticParseError[]) => {
    setSyntacticParseErrors(newErrors);
  }, []);

  const syntacticErrorCount = useMemo(() => syntacticParseErrors.length, [
    syntacticParseErrors,
  ]);

  const { handlePrettify } = usePrettier({
    code,
    setCode,
    showToast,
    syntacticErrorCount,
    rulerWidth,
  });

  const toggleSettings = useCallback(() => {
    setSettingsShown((prev) => !prev);
  }, []);

  const handleExpandAll = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.expandAll();
    }
  }, []);

  const handleCollapseAll = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.collapseAll();
    }
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Navbar
        theme={theme}
        onCopy={handleCopy}
        onSave={handleSave}
        onLoad={handleLoad}
        onShare={handleShare}
        onToggleSettings={toggleSettings}
        isSettingsShown={isSettingsShown}
      />
      <div className="flex-grow overflow-hidden" data-testid="main-content">
        <ResizableLayout
          theme={theme}
          isSettingsShown={isSettingsShown}
          isMobile={isMobile}
          onToggleSettings={toggleSettings}
        >
          <div className="flex flex-col h-full">
            <SubNav
              theme={theme}
              onPrettify={handlePrettify}
              onExpandAll={handleExpandAll}
              onCollapseAll={handleCollapseAll}
            />
            <div className="flex-grow overflow-auto">
              <Editor
                ref={editorRef}
                code={code}
                onCodeChange={setCode}
                onCursorChange={onCursorChange}
                onParseErrorChange={onParseErrorChange}
                theme={theme}
                rulerWidth={rulerWidth}
                autoDisplayCompletions={autoDisplayCompletions}
                enableLinting={enableLinting}
              />
            </div>
            <StatusBar
              lineCount={lineCount}
              characterCount={characterCount}
              syntacticErrorCount={syntacticErrorCount}
              cursorPosition={cursorPosition}
              enableLinting={enableLinting}
            />
          </div>

          <div className="h-full md:p-2 md:pl-0">
            <Settings
              theme={theme}
              onToggleTheme={toggleTheme}
              rulerWidth={rulerWidth}
              onRulerWidthChange={setRulerWidth}
              autoDisplayCompletions={autoDisplayCompletions}
              onAutoDisplayCompletionsChange={setAutoDisplayCompletions}
              enableLinting={enableLinting}
              onEnableLintingChange={setEnableLinting}
            />
          </div>
        </ResizableLayout>
      </div>
      {toastState && (
        <div className="toast toast-top toast-end mt-14">
          <div
            className={`alert ${
              toastState.type === "success"
                ? "alert-success"
                : toastState.type === "warning"
                ? "alert-warning"
                : "alert-error"
            }`}
          >
            <span>{toastState.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
