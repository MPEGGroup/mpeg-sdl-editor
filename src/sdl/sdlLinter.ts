import { syntaxTree } from "@codemirror/language";
import { type Diagnostic, linter } from "@codemirror/lint";
import { type SyntaxNodeRef } from "@lezer/common";
import { type Extension } from "@codemirror/state";
import {
  createParseErrorFromTextAndCursor,
  SyntacticParseError,
} from "@mpeggroup/mpeg-sdl-parser";

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
        const error = createParseErrorFromTextAndCursor(text, cursor);

        if (!errorRows.has(error.location!.row)) {
          errorRows.add(error.location!.row);

          errors.push(error);

          diagnostics.push({
            from: node.from,
            to: node.to,
            severity: "warning",
            message: error.errorMessage,
          });
        }
      }
    } while (cursor.next());

    if (options.onParseErrorChange) {
      options.onParseErrorChange(errors);
    }

    return diagnostics;
  });
}
