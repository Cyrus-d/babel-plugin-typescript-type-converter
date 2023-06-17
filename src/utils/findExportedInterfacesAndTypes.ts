import * as ts from 'typescript';

export function findExportedInterfacesAndTypes(sourceFile: ts.SourceFile): string[] {
  // Array to store exported interfaces and types
  const exportedSymbols: string[] = [];

  // Visit each node in the source file
  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
      // Check if the node is an exported interface or type
      if (
        node.modifiers &&
        node.modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
      ) {
        const { name } = node;
        if (name && name.escapedText) {
          exportedSymbols.push(name.escapedText);
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  // Start visiting the source file
  visit(sourceFile);

  return exportedSymbols;
}
