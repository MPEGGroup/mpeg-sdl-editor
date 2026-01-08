import { SyntacticParseError } from "@mpeggroup/mpeg-sdl-parser";
import { Editor } from "./components/Editor.tsx";
import type { EditorRef } from "./components/Editor.tsx";
import { Navbar } from "./components/Navbar.tsx";
import { SubNav } from "./components/SubNav.tsx";
import { InfoArea } from "./components/InfoArea.tsx";
import { StatusBar } from "./components/StatusBar.tsx";
import { ResizableLayout } from "./components/ResizableLayout.tsx";
import { useToast } from "./hooks/useToast.ts";
import { useFileOperations } from "./hooks/useFileOperations.ts";
import { useTheme } from "./hooks/useTheme.ts";
import { usePrettier } from "./hooks/usePrettier.ts";
import { useRulerWidth } from "./hooks/useRulerWidth.ts";
import { useCallback, useMemo, useRef, useState } from "react";
import { useMobileDetection } from "./hooks/useMobileDetection.ts";

export function App() {
  const initialCode =
    "// Start typing your SDL here... <Ctrl+Space> for suggestions\n";

  const [code, setCode] = useState<string>(initialCode);
  const [toastState, showToast] = useToast();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useMobileDetection();
  const [isInfoShown, setInfoShown] = useState(false);
  const { rulerWidth, setRulerWidth } = useRulerWidth();
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

  const toggleInfo = useCallback(() => {
    setInfoShown((prev) => !prev);
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
        onToggleInfo={toggleInfo}
        isInfoShown={isInfoShown}
      />
      <div className="flex-grow overflow-hidden" data-testid="main-content">
        <ResizableLayout
          theme={theme}
          isInfoShown={isInfoShown}
          isMobile={isMobile}
          onToggleInfo={toggleInfo}
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
              />
            </div>
            <StatusBar
              lineCount={lineCount}
              characterCount={characterCount}
              syntacticErrorCount={syntacticErrorCount}
              cursorPosition={cursorPosition}
            />
          </div>

          <div className="h-full md:p-2 md:pl-0">
            <InfoArea theme={theme} onToggleTheme={toggleTheme} rulerWidth={rulerWidth} onRulerWidthChange={setRulerWidth} />
          </div>
        </ResizableLayout>
      </div>
      {toastState && (
        <div className="toast toast-top toast-center sm:toast-end">
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
