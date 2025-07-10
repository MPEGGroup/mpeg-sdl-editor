import { syntaxTree } from "@codemirror/language";
import { type Diagnostic, linter } from "@codemirror/lint";
import { type SyntaxNodeRef } from "@lezer/common";
import { type Extension } from "@codemirror/state";
import { SyntacticParseError } from "@mpeggroup/mpeg-sdl-parser";

interface SdlLinterOptions {
  onParseErrorChange: (syntacticParseErrors: SyntacticParseError[]) => void;
}

export function sdlLinter(options: SdlLinterOptions): Extension {
  return linter((view) => {
    const diagnostics: Diagnostic[] = [];
    const errors: SyntacticParseError[] = [];
    const cursor = syntaxTree(view.state).cursor();
    const text = view.state.doc;
    const errorRows = new Set<number>();

    do {
      if (cursor.type.isError) {
        const node: SyntaxNodeRef = cursor.node;
        const error = SyntacticParseError.fromTextAndCursor(text, cursor);

        // only keep one error per line
        if (!errorRows.has(error.location!.row)) {
          errorRows.add(error.location!.row);

          // Store the error for external use
          errors.push(error);

          const cleanedMessage = error.errorMessage.split(" =>")[0];

          diagnostics.push({
            from: node.from,
            to: node.to,
            severity: "warning",
            message: cleanedMessage,
          });
        }
      }
    } while (cursor.next());

    // Call the callback
    if (options.onParseErrorChange) {
      options.onParseErrorChange(errors);
    }

    return diagnostics;
  });
}
