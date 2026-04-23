import { syntaxTree } from "@codemirror/language";
import { type Diagnostic, linter } from "@codemirror/lint";
import { type Extension } from "@codemirror/state";
import {
  buildAst,
  collateSyntaxErrors,
  createLenientSdlAnalyser,
  SdlStringInput,
  SemanticError,
  SemanticWarning,
  Specification,
  SyntaxError,
} from "@mpeggroup/mpeg-sdl-parser";

interface SdlLinterOptions {
  onSyntaxErrorChange: (syntaxErrors: SyntaxError[]) => void;
  onSemanticErrorChange: (semanticErrors: SemanticError[]) => void;
  onSemanticWarningChange: (semanticWarnings: SemanticWarning[]) => void;
  showSyntaxErrors: boolean;
  showSemanticErrors: boolean;
  showSemanticWarnings: boolean;
}

export function sdlLinter(options: SdlLinterOptions): Extension {
  return linter((view) => {
    const diagnostics: Diagnostic[] = [];
    const sdlParseTree = syntaxTree(view.state);
    const sdlStringInput = new SdlStringInput(view.state.doc.toString());
    const syntaxErrors = collateSyntaxErrors(sdlParseTree, sdlStringInput);
    const specification = buildAst(sdlParseTree, sdlStringInput, true);
    const analyser = createLenientSdlAnalyser();
    const analysisResult = analyser.analyse(specification as Specification);

    if (options.showSyntaxErrors) {
      for (const error of syntaxErrors) {
        diagnostics.push({
          from: error.location!.position,
          to: error.location!.position,
          severity: "error",
          message: error.errorMessage,
        });
      }
    }
    if (options.showSemanticErrors) {
      for (const error of analysisResult.semanticErrors) {
        diagnostics.push({
          from: error.location!.position,
          to: error.location!.position,
          severity: "error",
          message: error.errorMessage,
        });
      }
    }
    if (options.showSemanticWarnings) {
      for (const warning of analysisResult.semanticWarnings) {
        diagnostics.push({
          from: warning.location!.position,
          to: warning.location!.position,
          severity: "warning",
          message: warning.errorMessage,
        });
      }
    }

    if (options.onSyntaxErrorChange) {
      options.onSyntaxErrorChange(syntaxErrors);
    }
    if (options.onSemanticErrorChange) {
      options.onSemanticErrorChange(analysisResult.semanticErrors);
    }
    if (options.onSemanticWarningChange) {
      options.onSemanticWarningChange(analysisResult.semanticWarnings);
    }

    return diagnostics;
  });
}
