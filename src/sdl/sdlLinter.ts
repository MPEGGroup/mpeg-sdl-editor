import { syntaxTree } from "@codemirror/language";
import {
  type Diagnostic,
  forEachDiagnostic,
  linter,
  setDiagnostics,
} from "@codemirror/lint";
import { type Extension } from "@codemirror/state";
import { EditorView, ViewPlugin, type ViewUpdate } from "@codemirror/view";
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

const DEBOUNCE_MS = 100;

export function sdlLinter(options: SdlLinterOptions): Extension {
  // Dispatch clear then set as two separate transactions so CodeMirror destroys
  // and recreates the widget DOM node rather than reusing/moving it. Safari's
  // contenteditable engine silently ignores in-place widget moves, so without
  // the clear the indicator never visually repositions.
  function dispatchDiagnostics(view: EditorView, diagnostics: Diagnostic[]) {
    view.dispatch(setDiagnostics(view.state, []));
    view.dispatch(setDiagnostics(view.state, diagnostics));
  }

  function runLint(view: EditorView) {
    const currentDoc = view.state.doc;
    try {
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

      if (view.state.doc === currentDoc) {
        dispatchDiagnostics(view, diagnostics);
      }
    } catch {
      if (view.state.doc === currentDoc) {
        view.dispatch(setDiagnostics(view.state, []));
      }
    }
  }

  const rafLintPlugin = ViewPlugin.fromClass(
    class {
      private lastChangeAt = 0;
      private rafId = 0;

      constructor(private readonly view: EditorView) {
        requestAnimationFrame(() => runLint(this.view));
      }

      update(update: ViewUpdate) {
        if (!update.docChanged) {
          return;
        }

        // Immediately remap existing diagnostics with positive bias so
        // insertions AT a zero-width marker push it forward right away.
        const remapped: Diagnostic[] = [];
        forEachDiagnostic(update.startState, (d, from, to) => {
          remapped.push({
            ...d,
            from: update.changes.mapPos(from, 1),
            to: update.changes.mapPos(to, 1),
          });
        });
        const snapDoc = update.state.doc;
        requestAnimationFrame(() => {
          if (this.view.state.doc === snapDoc) {
            dispatchDiagnostics(this.view, remapped);
          }
        });

        this.lastChangeAt = Date.now();
        cancelAnimationFrame(this.rafId);
        this.rafId = requestAnimationFrame(() => this.tick());
      }

      private tick() {
        if (Date.now() - this.lastChangeAt >= DEBOUNCE_MS) {
          runLint(this.view);
        } else {
          this.rafId = requestAnimationFrame(() => this.tick());
        }
      }

      destroy() {
        cancelAnimationFrame(this.rafId);
      }
    },
  );

  // linter(null) registers the diagnostic state field, decorations and theme
  // without attaching a lint source — we drive everything from rafLintPlugin.
  return [linter(null), rafLintPlugin];
}
