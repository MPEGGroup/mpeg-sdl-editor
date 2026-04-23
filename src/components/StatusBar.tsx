interface StatusBarProps {
  lineCount: number;
  characterCount: number;
  syntaxErrorCount: number;
  semanticErrorCount: number;
  semanticWarningCount: number;
  cursorPosition: { line: number; col: number };
  enableLinting: boolean;
  showSyntaxErrors: boolean;
  showSemanticErrors: boolean;
  showSemanticWarnings: boolean;
}

export function StatusBar({
  lineCount,
  characterCount,
  syntaxErrorCount,
  semanticErrorCount,
  semanticWarningCount,
  cursorPosition,
  enableLinting,
  showSyntaxErrors,
  showSemanticErrors,
  showSemanticWarnings,
}: StatusBarProps) {
  return (
    <div className="h-6 bg-base-200 border-t border-base-300 px-3 flex items-center justify-between text-xs text-base-content/70">
      <div className="flex items-center space-x-4">
        <span>Lines: {lineCount}</span>
        <span>Characters: {characterCount}</span>
        {enableLinting && showSyntaxErrors && (
          <span>Syntax Errors: {syntaxErrorCount}</span>
        )}
        {enableLinting && showSemanticErrors && (
          <span>Semantic Errors: {semanticErrorCount}</span>
        )}
        {enableLinting && showSemanticWarnings && (
          <span>Semantic Warnings: {semanticWarningCount}</span>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <span>Row: {cursorPosition.line}</span>
        <span>Column: {cursorPosition.col}</span>
      </div>
    </div>
  );
}
