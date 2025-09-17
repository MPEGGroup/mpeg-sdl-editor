import { LRParser as LezerParser } from "@lezer/lr";
import { type Extension } from "@codemirror/state";
import { styleTags, tags as t } from "@lezer/highlight";
import { createLenientSdlParser } from "@mpeggroup/mpeg-sdl-parser";
import {
  foldNodeProp,
  LanguageSupport,
  LRLanguage,
} from "@codemirror/language";
import { sdlComplete } from "./sdlComplete.ts";

export function createParser(): LezerParser {
  const parser = createLenientSdlParser();

  return parser.configure({
    props: [
      styleTags({
        int: t.typeName,
        unsigned: t.typeName,
        float: t.typeName,
        bit: t.typeName,
        Comment: t.comment,
        Identifier: t.variableName,
        BinaryLiteral: t.literal,
        HexadecimalLiteral: t.literal,
        MultipleCharacterLiteral: t.literal,
        IntegerLiteral: t.number,
        DecimalLiteral: t.number,
        FloatingPointLiteral: t.number,
        Base64StringLiteral: t.string,
        UtfStringLiteral: t.string,
        _if: t.controlKeyword,
        _else: t.controlKeyword,
        _switch: t.controlKeyword,
        _case: t.controlKeyword,
        _break: t.controlKeyword,
        _do: t.controlKeyword,
        _while: t.controlKeyword,
        _class: t.keyword,
        _extends: t.keyword,
        _const: t.keyword,
        map: t.keyword,
        utf8string: t.keyword,
        utf8list: t.keyword,
        utfstring: t.keyword,
        utf16string: t.keyword,
        reserved: t.keyword,
        legacy: t.keyword,
        base64string: t.keyword,
        aligned: t.keyword,
        expandable: t.keyword,
        abstract: t.keyword,
        computed: t.keyword,
        OpenBrace: t.brace,
        CloseBrace: t.brace,
        CloseParenthesis: t.paren,
        OpenParenthesis: t.paren,
        OpenBracket: t.squareBracket,
        CloseBracket: t.squareBracket,
        PostfixIncrement: t.arithmeticOperator,
        PostfixDecrement: t.arithmeticOperator,
        UnaryPlus: t.arithmeticOperator,
        UnaryNegation: t.arithmeticOperator,
        Multiplication: t.arithmeticOperator,
        Division: t.arithmeticOperator,
        Modulus: t.arithmeticOperator,
        Addition: t.arithmeticOperator,
        Subtraction: t.arithmeticOperator,
        RelationalLessThan: t.compareOperator,
        RelationalLessThanOrEqual: t.compareOperator,
        RelationalGreaterThan: t.compareOperator,
        RelationalGreaterThanOrEqual: t.compareOperator,
        RelationalEqual: t.compareOperator,
        RelationalNotEqual: t.compareOperator,
        BitwiseShiftLeft: t.bitwiseOperator,
        BitwiseShiftRight: t.bitwiseOperator,
        BitwiseAnd: t.bitwiseOperator,
        BitwiseOr: t.bitwiseOperator,
        LogicalAnd: t.logicOperator,
        LogicalOr: t.logicOperator,
        lengthof: t.operatorKeyword,
        RangeOperator: t.operator,
        Assignment: t.operator,
        LookAhead: t.operator,
        Period: t.punctuation,
        UtfPrefix: t.punctuation,
        Colon: t.punctuation,
        Semicolon: t.punctuation,
        Comma: t.punctuation,
        SingleQuote: t.punctuation,
        DoubleQuote: t.punctuation,
      }),
      foldNodeProp.add((type) => {
        return type.is("ClassDeclaration") ||
            type.is("MapDeclaration") || type.is("CompoundStatement") ||
            type.is("SwitchStatement") || type.is("CaseClause") ||
            type.is("DefaultClause") || type.is("IfStatement") ||
            type.is("WhileStatement") || type.is("DoStatement") ||
            type.is("ForStatement")
          ? (tree, state) => ({
            from: state.doc.lineAt(tree.from).to,
            to: tree.to,
          })
          : undefined;
      }),
    ],
  });
}

export const sdlLanguage = LRLanguage.define({
  parser: createParser(),
  languageData: {
    commentTokens: { line: "//" },
  },
});

export const sdlCompletion = sdlLanguage.data.of({
  autocomplete: sdlComplete,
});

export function sdl(): Extension {
  return new LanguageSupport(sdlLanguage, [sdlCompletion]);
}
