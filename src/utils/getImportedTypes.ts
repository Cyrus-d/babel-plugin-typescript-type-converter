/* eslint-disable no-restricted-syntax */
import * as ts from 'typescript';

interface ImportedType {
  importedTypeName: string;
  importFileName: string;
}

function getSourceFileForType(sourceFile: ts.SourceFile, typeName: string): string | undefined {
  const program = ts.createProgram([sourceFile.fileName], {});
  const checker = program.getTypeChecker();

  function visit(node: ts.Node): string | undefined {
    if (ts.isTypeReferenceNode(node)) {
      const symbol = checker.getSymbolAtLocation(node.typeName);
      if (symbol && symbol.declarations && symbol.declarations.length > 0) {
        const declaration = symbol.declarations[0];
        if (ts.isSourceFile(declaration)) {
          return declaration.fileName;
        }
      }
    }

    return ts.forEachChild(node, visit);
  }

  return visit(sourceFile);
}

export function getImportedTypes(sourceFile: ts.SourceFile, typeName: string): ImportedType[] {
  const importedTypes: ImportedType[] = [];

  function visitNode(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      const { importClause } = node;
      if (
        importClause &&
        importClause.namedBindings &&
        ts.isNamedImports(importClause.namedBindings)
      ) {
        for (const importSpecifier of importClause.namedBindings.elements) {
          if (
            importSpecifier.propertyName &&
            importSpecifier.propertyName.escapedText === typeName
          ) {
            const importFileName = node.moduleSpecifier.getText().slice(1, -1); // Remove the quotes around the import path
            const importedTypeName = importSpecifier.name.escapedText.toString();
            importedTypes.push({ importedTypeName, importFileName });
          } else if (importSpecifier.name.escapedText === typeName) {
            const importFileName = node.moduleSpecifier.getText().slice(1, -1); // Remove the quotes around the import path
            const importedTypeName = importSpecifier.name.escapedText.toString();
            importedTypes.push({ importedTypeName, importFileName });
          }
        }
      }
    } else if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
      if (node.name.escapedText === typeName) {
        for (const heritageClause of (node as any).heritageClauses || []) {
          for (const type of heritageClause.types) {
            const typeText = type.getText();
            const importFileName = getSourceFileForType(sourceFile, typeText);
            if (importFileName) {
              importedTypes.push({ importedTypeName: typeText, importFileName });
            }
          }
        }
      }
    }

    ts.forEachChild(node, visitNode);
  }

  visitNode(sourceFile);

  return importedTypes;
}

/**

create function to return all named imports filename call it `getImportedInfoByName`

it will called like this getImportedInfoByName(sourceFile: ts.SourceFile, namedImports: string[])

example1.ts
`
import {Foo} from './file1'
`
should return [{name:'Foo',file:'./file1'}]


example2.ts
`
import * as File from './file1'

export File.Foo
`
in above example it must detect if type is alias and return
should return [{name:'Foo',file:'./file1'}]


 */
