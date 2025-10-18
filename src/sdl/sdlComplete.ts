import {
  CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import type { SyntaxNode, Tree } from "@lezer/common";
import { syntaxTree } from "@codemirror/language";

// TODO: import type IDs
const contextualCompletionStringsMap: Record<string, string[]> = {
  unsigned: ["int"],
  reserved: [
    "const",
    "aligned",
    "int",
    "unsigned",
    "float",
    "bit",
    "utf16string",
    "utf8string",
    "utf8list",
    "utfstring",
    "base64string",
  ],
  legacy: [
    "const",
    "aligned",
    "int",
    "unsigned",
    "float",
    "bit",
    "utf16string",
    "utf8string",
    "utf8list",
    "utfstring",
    "base64string",
  ],
  const: [
    "aligned",
    "int",
    "unsigned",
    "float",
    "bit",
    "utf16string",
    "utf8string",
    "utf8list",
    "utfstring",
    "base64string",
  ],
  aligned: [
    "int",
    "unsigned",
    "float",
    "bit",
    "utf16string",
    "utf8string",
    "utf8list",
    "utfstring",
    "base64string",
  ],
};

const globalScopeCompletionStrings: string[] = [
  "computed",
  "map",
  "aligned",
  "expandable",
  "abstract",
  "class",
];

const blockScopeCompletionStrings: string[] = [
  "if",
  "switch",
  "do",
  "for",
  "while",
  "reserved",
  "legacy",
  "const",
  "aligned",
  "int",
  "unsigned",
  "float",
  "bit",
  "utf16string",
  "utf8string",
  "utf8list",
  "utfstring",
  "base64string",
];

const caseClauseCompletionStrings: string[] = [
  "break",
  ...blockScopeCompletionStrings,
];

const switchScopeCompletionStrings: string[] = [
  "case",
  "default",
];

function isCommentCompletion(lastNode: SyntaxNode): boolean {
  return lastNode.type.name === "Comment";
}

function isGlobalScopeCompletion(lastNode: SyntaxNode): boolean {
  // see if the last node is a specification
  if (lastNode.type.name === "Specification") {
    return true;
  }

  // see if the parent of the last node is a specification
  const parentNode = lastNode.parent;

  return parentNode?.type.name === "Specification";
}

function previousTokenIsOneOf(node: SyntaxNode, tokenNames: string[]): boolean {
  // loop backwards through the siblings of the current node to find the previous token that matches one of the specified token names
  let currentNode: SyntaxNode | null = node;

  while (currentNode) {
    // stop looking if we hit a non-matching whitespace node
    if (currentNode.type.name === "Whitespace") {
      currentNode = currentNode.prevSibling;
      continue;
    }
    return (tokenNames.includes(currentNode.type.name));
  }

  return false;
}

const statements = [
  "CompoundStatement",
  "IfStatement",
  "SwitchStatement",
  "ForStatement",
  "DoStatement",
  "WhileStatement",
  "ExpressionStatement",
  "ElementaryTypeDefinition",
  "MapDefinition",
  "ClassDefinition",
  "StringDefinition",
  "ArrayDefinition",
  "ComputedElementaryTypeDefinition",
  "ComputedArrayDefinition",
  "Comment",
];

function isBlockScopeCompletion(lastNode: SyntaxNode): boolean {
  // see if the parent of the last node is a block scoped node
  const parentNode = lastNode.parent;

  if (!parentNode) {
    return false;
  }

  const name = parentNode.type.name;

  if (
    (name === "ClassDeclaration") &&
    (previousTokenIsOneOf(lastNode, ["OpenBrace", ...statements]))
  ) {
    return true;
  }
  if (
    (name === "CompoundStatement") &&
    (previousTokenIsOneOf(lastNode, ["OpenBrace", ...statements]))
  ) {
    return true;
  }
  if (
    (name === "IfStatement") &&
    (previousTokenIsOneOf(lastNode, ["CloseParenthesis", "else"]))
  ) {
    return true;
  }
  if (
    (name === "DefaultClause") && (previousTokenIsOneOf(lastNode, ["Colon"]))
  ) {
    return true;
  }

  return false;
}

function isSwitchScopeCompletion(lastNode: SyntaxNode): boolean {
  // see if the parent of the last node is a switch statement
  const parentNode = lastNode.parent;

  return (parentNode?.type.name === "SwitchStatement") &&
    previousTokenIsOneOf(lastNode, ["OpenBrace"]);
}

function isCaseClauseCompletion(lastNode: SyntaxNode): boolean {
  // see if the parent of the last node is a case clause
  const parentNode = lastNode.parent;
  return ((parentNode?.type.name === "SwitchStatement") ||
    (parentNode?.type.name === "CaseClause")) &&
    previousTokenIsOneOf(lastNode, [
      "Colon",
      "OpenBrace",
      "CaseClause",
      ...statements,
    ]);
}

function getContextualCompletionOptions(
  tree: Tree,
  lastNode: SyntaxNode,
): string[] | null {
  // see if we are completing after whitespace
  if (lastNode.type.name === "Whitespace") {
    // look for the node before the current whitespace
    const secondLastNode = tree.resolveInner(lastNode.from - 1, -1);

    // if there is a previous node, we can provide completions based on that
    if (secondLastNode) {
      return contextualCompletionStringsMap[secondLastNode.type.name];
    }
  }

  // see if we are completing partway through an identifier (i.e. a word not yet recognized as a keyword or type name)
  if (lastNode.type.name === "Identifier") {
    // look for the previous node before the partly typed identifier
    const secondLastNode = tree.resolveInner(lastNode.from - 1, -1);

    // if it is whitespace, we can provide completions based on the previous node before the whitespace
    if (secondLastNode.type.name === "Whitespace") {
      const thirdLastNode = tree.resolveInner(secondLastNode.from - 1, -1);

      if (thirdLastNode.type.name !== "Whitespace") {
        return contextualCompletionStringsMap[thirdLastNode.type.name];
      }
    } else {
      return contextualCompletionStringsMap[secondLastNode.type.name];
    }
  }

  return null;
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
  const tree = syntaxTree(context.state);
  const lastNode = tree.resolveInner(context.pos, -1);
  const lastText = context.state.sliceDoc(lastNode.from, context.pos);
  const lastTag = /^\w*$/.exec(lastText);

  // Don't provide within a comment
  if (isCommentCompletion(lastNode)) {
    return null;
  }

  if (isGlobalScopeCompletion(lastNode)) {
    // only provide completions at the global scope if completion was explicitly requested
    if (!context.explicit) {
      return null;
    }

    return getCompletionResult(
      globalScopeCompletionStrings,
      lastTag ? lastNode.from + lastTag.index : context.pos,
    );
  }

  if (isBlockScopeCompletion(lastNode)) {
    // only provide completions at the block scope if completion was explicitly requested
    if (!context.explicit) {
      return null;
    }

    return getCompletionResult(
      blockScopeCompletionStrings,
      lastTag ? lastNode.from + lastTag.index : context.pos,
    );
  }

  if (isCaseClauseCompletion(lastNode)) {
    return getCompletionResult(
      caseClauseCompletionStrings,
      lastTag ? lastNode.from + lastTag.index : context.pos,
    );
  }

  if (isSwitchScopeCompletion(lastNode)) {
    return getCompletionResult(
      switchScopeCompletionStrings,
      lastTag ? lastNode.from + lastTag.index : context.pos,
    );
  }

  const completions = getContextualCompletionOptions(tree, lastNode);

  if (completions) {
    return getCompletionResult(
      completions,
      lastTag ? lastNode.from + lastTag.index : context.pos,
    );
  }

  return null;
}

export { sdlComplete };
