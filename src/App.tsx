import {
  SemanticError,
  SemanticWarning,
  SyntaxError,
} from "@mpeggroup/mpeg-sdl-parser";
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
import { useShowSyntaxErrors } from "./hooks/useShowSyntaxErrors.ts";
import { useShowSemanticErrors } from "./hooks/useShowSymanticErrors.ts";
import { useShowSemanticWarnings } from "./hooks/useShowSemanticWarnings.ts";

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
  const { showSyntaxErrors, setShowSyntaxErrors } = useShowSyntaxErrors();
  const { showSemanticErrors, setShowSemanticErrors } = useShowSemanticErrors();
  const { showSemanticWarnings, setShowSemanticWarnings } =
    useShowSemanticWarnings();
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
  const [syntaxErrors, setSyntaxErrors] = useState<SyntaxError[]>([]);
  const [semanticErrors, setSemanticErrors] = useState<SemanticError[]>([]);
  const [semanticWarnings, setSemanticWarnings] = useState<SemanticWarning[]>(
    [],
  );

  const onSyntaxErrorChange = useCallback((newErrors: SyntaxError[]) => {
    setSyntaxErrors(newErrors);
  }, []);

  const onSemanticErrorChange = useCallback((newErrors: SemanticError[]) => {
    setSemanticErrors(newErrors);
  }, []);

  const onSemanticWarningChange = useCallback(
    (newErrors: SemanticWarning[]) => {
      setSemanticWarnings(newErrors);
    },
    [],
  );

  const syntaxErrorCount = useMemo(() => syntaxErrors.length, [
    syntaxErrors,
  ]);

  const semanticErrorCount = useMemo(() => semanticErrors.length, [
    semanticErrors,
  ]);

  const semanticWarningCount = useMemo(() => semanticWarnings.length, [
    semanticWarnings,
  ]);

  const { handlePrettify } = usePrettier({
    code,
    setCode,
    showToast,
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
      <div className="grow overflow-hidden" data-testid="main-content">
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
            <div className="grow overflow-auto">
              <Editor
                ref={editorRef}
                code={code}
                onCodeChange={setCode}
                onCursorChange={onCursorChange}
                onSyntaxErrorChange={onSyntaxErrorChange}
                onSemanticErrorChange={onSemanticErrorChange}
                onSemanticWarningChange={onSemanticWarningChange}
                theme={theme}
                rulerWidth={rulerWidth}
                autoDisplayCompletions={autoDisplayCompletions}
                enableLinting={enableLinting}
                showSyntaxErrors={showSyntaxErrors}
                showSemanticErrors={showSemanticErrors}
                showSemanticWarnings={showSemanticWarnings}
              />
            </div>
            <StatusBar
              lineCount={lineCount}
              characterCount={characterCount}
              syntaxErrorCount={syntaxErrorCount}
              semanticErrorCount={semanticErrorCount}
              semanticWarningCount={semanticWarningCount}
              cursorPosition={cursorPosition}
              enableLinting={enableLinting}
              showSyntaxErrors={showSyntaxErrors}
              showSemanticErrors={showSemanticErrors}
              showSemanticWarnings={showSemanticWarnings}
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
              showSyntaxErrors={showSyntaxErrors}
              onShowSyntaxErrorsChange={setShowSyntaxErrors}
              showSemanticErrors={showSemanticErrors}
              onShowSemanticErrorsChange={setShowSemanticErrors}
              showSemanticWarnings={showSemanticWarnings}
              onShowSemanticWarningsChange={setShowSemanticWarnings}
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
