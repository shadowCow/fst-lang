import { assertNever } from "@cow-sunday/fp-ts";
import { Range } from "vscode-languageserver-textdocument";

export type Ast = AstBranch | AstLeaf;

export type BranchKind = "Root" | "Moves";

export type AstBranch = {
  kind: "AstBranch";
  branchKind: BranchKind;
  children: Array<Ast>;
};

export function root(firstChild: Ast): AstBranch {
  return {
    kind: "AstBranch",
    branchKind: "Root",
    children: [firstChild],
  };
}

export function moves(movesKw: AstLeaf): AstBranch {
  return {
    kind: "AstBranch",
    branchKind: "Moves",
    children: [movesKw],
  };
}

export type LeafKind = "LineComment" | "MovesKw" | "Unknown";

export type AstLeaf = {
  kind: "AstLeaf";
  leafKind: LeafKind;
  range: Range;
  value: string;
};

export function lineComment(range: Range, value: string): AstLeaf {
  return {
    kind: "AstLeaf",
    leafKind: "LineComment",
    range,
    value,
  };
}

export function movesKw(range: Range, value: string): AstLeaf {
  return {
    kind: "AstLeaf",
    leafKind: "MovesKw",
    range,
    value,
  };
}

export function unknownLeaf(range: Range, value: string): AstLeaf {
  return {
    kind: "AstLeaf",
    leafKind: "Unknown",
    range,
    value,
  };
}

export function astRange(astNode: Ast): Range {
  switch (astNode.kind) {
    case "AstBranch":
      return {
        start: astRange(astNode.children[0]).start,
        end: astRange(astNode.children[astNode.children.length - 1]).end,
      };
    case "AstLeaf":
      return astNode.range;
    default:
      assertNever(astNode);
  }
}
