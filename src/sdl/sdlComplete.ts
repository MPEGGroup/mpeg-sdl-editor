import {
  CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import type { SyntaxNode } from "@lezer/common";
import { syntaxTree } from "@codemirror/language";
import { foldNodeProp } from "@codemirror/language";
import {
  getPotentialSyntacticTokens,
  TokenTypeId,
} from "@mpeggroup/mpeg-sdl-parser";

function isCommentCompletion(lastNode: SyntaxNode): boolean {
  return lastNode.type.id === TokenTypeId.Comment;
}

function isGlobalScopeCompletion(lastNode: SyntaxNode): boolean {
  // see if the last node is a specification
  if (lastNode.type.id === TokenTypeId.Specification) {
    return true;
  }

  // see if the parent of the last node is a specification
  const parentNode = lastNode.parent;

  return parentNode?.type.id === TokenTypeId.Specification;
}

function isBlockScopeCompletion(lastNode: SyntaxNode): boolean {
  // see if the parent of the last node is a block scoped node
  const parentNode = lastNode.parent;

  if (!parentNode) {
    return false;
  }

  return parentNode.type.prop(foldNodeProp) !== undefined;
}

function getCompletionResult(
  completionOptions: string[],
  from: number,
): CompletionResult {
  return {
    from,
    options: completionOptions.map((label) => ({ label })),
    validFor: /^\w*$/,
  };
}

function sdlComplete(context: CompletionContext): CompletionResult | null {
  const parseTree = syntaxTree(context.state);
  const lastNode = parseTree.resolveInner(context.pos, -1);

  // Don't provide completions within a comment
  if (isCommentCompletion(lastNode)) {
    console.error("No completions in comments");
    return null;
  }

  // only provide completions at the global scope if completion was explicitly requested
  if (isGlobalScopeCompletion(lastNode) && !context.explicit) {
    return null;
  }

  // only provide completions at the block scope if completion was explicitly requested
  if (isBlockScopeCompletion(lastNode) && !context.explicit) {
    return null;
  }

  const lastText = context.state.sliceDoc(lastNode.from, context.pos);
  const lastTag = /^\w*$/.exec(lastText);

  const completions = getPotentialSyntacticTokens(lastNode.cursor());

  if (completions && (completions.length > 0)) {
    return getCompletionResult(
      completions,
      lastTag ? lastNode.from + lastTag.index : context.pos,
    );
  }

  return null;
}

export { sdlComplete };
