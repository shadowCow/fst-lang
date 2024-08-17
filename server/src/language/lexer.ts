import { Range, TextDocument } from "vscode-languageserver-textdocument";
import { AstLeaf, LeafKind, lineComment, movesKw, unknownLeaf } from "./ast";

export type Lexer = {
  isEof(): boolean;
  getOffset(): number;
  lex(): AstLeaf | typeof eof;
};

export function createLexer(document: TextDocument): Lexer {
  const text = document.getText();
  let offset = 0;

  const getOffset: () => number = () => offset;

  const lex: () => AstLeaf | typeof eof = () => {
    eatWhitespace();
    if (isEof()) {
      return eof;
    }

    return lexToken();
  };

  function lexToken(): AstLeaf {
    const ch = currentCh();
    if (isLetter(ch)) {
      return lexWord();
    }

    switch (ch) {
      case "#":
        return lexLineComment();
      default:
        return lexUnknown();
    }
  }

  function lexWord(): AstLeaf {
    const startOffset = offset;
    while (isWordChar(currentCh())) {
      advance();
    }

    return wordToLeaf(startOffset);
  }

  function lexLineComment(): AstLeaf {
    const startOffset = offset;
    advanceToEol();

    return lineComment(rangeFrom(startOffset), valueFrom(startOffset));
  }

  function lexUnknown(): AstLeaf {
    const startOffset = offset;

    while (!isEol()) {
      const ch = currentCh();
      if (isWhitespace(ch)) {
        break;
      }
    }

    return unknownLeaf(rangeFrom(startOffset), valueFrom(startOffset));
  }

  function currentCh(): string {
    return text.charAt(offset);
  }

  function eatWhitespace() {
    while (!isEof()) {
      const ch = currentCh();
      if (isWhitespace(ch)) {
        offset += 1;
      } else {
        return;
      }
    }
  }

  function advance() {
    offset += 1;
  }

  function advanceToEol() {
    while (!isEol()) {
      offset += 1;
    }
  }

  function isLetter(ch: string): boolean {
    const code = ch.charCodeAt(0);
    return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
  }

  function isWordChar(ch: string): boolean {
    return isLetter(ch) || isDigit(ch) || ch === "_";
  }

  function isNewlineCh(ch: string): boolean {
    return ch === "\r" || ch === "\n";
  }

  function isDigit(char: string): boolean {
    const code = char.charCodeAt(0);
    return code >= 48 && code <= 57;
  }

  function isWhitespace(ch: string): boolean {
    return isNewlineCh(ch) || ch === "\t" || ch === " ";
  }

  function isEol(): boolean {
    return isEof() || isNewlineCh(currentCh());
  }

  function isEof(): boolean {
    return offset >= text.length;
  }

  function rangeFrom(startOffset: number): Range {
    return {
      start: document.positionAt(startOffset),
      end: document.positionAt(offset),
    };
  }

  function valueFrom(startOffset: number): string {
    return text.substring(startOffset, offset);
  }

  function wordToLeaf(startOffset: number): AstLeaf {
    const value = valueFrom(startOffset);

    const maybeKw = keywords[value.toLowerCase()];
    switch (maybeKw) {
      case "LineComment":
        return lineComment(rangeFrom(startOffset), valueFrom(startOffset));
      case "MovesKw":
        return movesKw(rangeFrom(startOffset), valueFrom(startOffset));
      default:
        return unknownLeaf(rangeFrom(startOffset), valueFrom(startOffset));
    }
  }

  return {
    isEof,
    getOffset,
    lex,
  };
}

export const eof = Symbol("eof");

export const keywords: { [index: string]: LeafKind } = {
  ["moves"]: "MovesKw",
};
