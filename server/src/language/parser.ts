import { TextDocument } from "vscode-languageserver-textdocument";
import { Ast, AstLeaf, moves, root, unknownLeaf } from "./ast";
import {
  createDiagnostics,
  Diagnostics,
  unknownDiagnostic,
} from "./diagnostics";
import { createLexer, eof } from "./lexer";
import { assertNever } from "@cow-sunday/fp-ts";

export type Parser = {
  parse(): [Ast | null, Diagnostics];
};

export function createParser(document: TextDocument): Parser {
  const diagnostics = createDiagnostics();
  const lexer = createLexer(document);

  function parse(): [Ast | null, Diagnostics] {
    if (document.getText().length === 0) {
      return [null, diagnostics];
    }

    const firstLeaf = lexer.lex();
    if (firstLeaf == eof) {
      return [null, diagnostics];
    }

    const rootNode = parseRoot(firstLeaf, diagnostics);

    return [rootNode, diagnostics];
  }

  function parseRoot(firstToken: AstLeaf, diagnostics: Diagnostics): Ast {
    const rootNode = root(parseBlock(firstToken, diagnostics));

    while (!lexer.isEof()) {
      const leaf = lexer.lex();
      if (leaf === eof) {
        return rootNode;
      }

      const block = parseBlock(leaf, diagnostics);
      rootNode.children.push(block);
    }

    return rootNode;
  }

  function parseBlock(firstLeaf: AstLeaf, diagnostics: Diagnostics): Ast {
    switch (firstLeaf.leafKind) {
      case "LineComment":
        return firstLeaf;
      case "MovesKw":
        return parseMoves(firstLeaf, diagnostics);
      case "Unknown":
        diagnostics.Add(unknownDiagnostic(firstLeaf));
        return firstLeaf;
      default:
        diagnostics.Add(unknownDiagnostic(firstLeaf));
        return firstLeaf;
    }
  }

  function parseMoves(kw: AstLeaf, diagnostics: Diagnostics): Ast {
    const branch = moves(kw);

    // TODO - actually parse

    return branch;
  }

  return {
    parse,
  };
}
