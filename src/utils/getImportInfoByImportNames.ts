/* eslint-disable sort-keys */
import * as ts from 'typescript';

interface ImportedInfo {
  name: string;
  file: string;
}

export function getImportInfoByImportNames(
  sourceFile: ts.SourceFile,
  namedImports: string[],
): ImportedInfo[] {
  const importedInfo: ImportedInfo[] = [];

  function visitNode(node: ts.Node) {
    if (ts.isImportDeclaration(node) && node.importClause && node.importClause.namedBindings) {
      const { namedBindings } = node.importClause;

      if (ts.isNamedImports(namedBindings)) {
        namedBindings.elements.forEach((element) => {
          const name = element.name.text;
          const file = (node.moduleSpecifier as any).text; // Remove the quotes around the file path
          if (namedImports.includes(name)) {
            importedInfo.push({ name, file });
          }
        });
      }
    }

    ts.forEachChild(node, visitNode);
  }

  visitNode(sourceFile);

  return importedInfo;
}
