import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { Range } from "vscode-languageserver-textdocument";
import { AstLeaf } from "./ast";

export type Diagnostics = {
  Add: (d: Diagnostic) => void;
  List: () => Array<Diagnostic>;
};

export function createDiagnostics(): Diagnostics {
  const diagnostics: Array<Diagnostic> = [];

  const d: Diagnostics = {
    Add: function (d: Diagnostic): void {
      diagnostics.push(d);
    },
    List: function (): Array<Diagnostic> {
      return [...diagnostics];
    },
  };

  return d;
}

export function unknownDiagnostic(leaf: AstLeaf): Diagnostic {
  const d: Diagnostic = {
    severity: DiagnosticSeverity.Error,
    range: leaf.range,
    message: `unknown token ${leaf.value}`,
  };

  return d;
}
