interface StatusBarProps {
  lineCount: number;
  characterCount: number;
  syntacticErrorCount: number;
  cursorPosition: { line: number; col: number };
  enableLinting: boolean;
}

export function StatusBar({
  lineCount,
  characterCount,
  syntacticErrorCount,
  cursorPosition,
  enableLinting,
}: StatusBarProps) {
  return (
    <div className="h-6 bg-base-200 border-t border-base-300 px-3 flex items-center justify-between text-xs text-base-content/70">
      <div className="flex items-center space-x-4">
        <span>Lines: {lineCount}</span>
        <span>Characters: {characterCount}</span>
        {enableLinting && <span>Syntactic Errors: {syntacticErrorCount}</span>}
      </div>
      <div className="flex items-center space-x-4">
        <span>Row: {cursorPosition.line}</span>
        <span>Column: {cursorPosition.col}</span>
      </div>
    </div>
  );
}
