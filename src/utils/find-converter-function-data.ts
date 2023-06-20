/* eslint-disable no-restricted-syntax */
import * as ts from 'typescript';
import * as converterFuncNames from '../constants/convert-functions';

const convertFuncNamesArr = Object.values(converterFuncNames);

interface FunctionInfo {
  functionName: string;
  types: { name: string; path?: string }[];
}

function getTypeImportPath(typeName: ts.Identifier, sourceFile: ts.SourceFile): string | undefined {
  const importDeclarations = sourceFile.statements.filter(ts.isImportDeclaration);

  for (const importDeclaration of importDeclarations) {
    const namedBindings = importDeclaration.importClause?.namedBindings;

    if (namedBindings && ts.isNamedImports(namedBindings)) {
      for (const element of namedBindings.elements) {
        if (element.name.text === typeName.text) {
          return importDeclaration.moduleSpecifier.getText(sourceFile).slice(1, -1);
        }
      }
    }
  }

  return undefined;
}

export function findConverterFunctionData(
  sourceFile: ts.SourceFile,
  functionNames: string[] = convertFuncNamesArr,
): FunctionInfo[] {
  const functionInfos: FunctionInfo[] = [];

  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      functionNames.includes(node.expression.text)
    ) {
      const { typeArguments } = node;
      if (typeArguments && typeArguments.length > 0) {
        const types: { name: string; path?: string }[] = [];

        for (const typeArgument of typeArguments) {
          if (ts.isTypeReferenceNode(typeArgument) && ts.isIdentifier(typeArgument.typeName)) {
            const typeName = typeArgument.typeName.text;
            const typePath = getTypeImportPath(typeArgument.typeName, sourceFile);
            types.push({ name: typeName, path: typePath });
          } else if (ts.isIntersectionTypeNode(typeArgument)) {
            for (const intersectionType of typeArgument.types) {
              if (
                ts.isTypeReferenceNode(intersectionType) &&
                ts.isIdentifier(intersectionType.typeName)
              ) {
                const typeName = intersectionType.typeName.text;
                const typePath = getTypeImportPath(intersectionType.typeName, sourceFile);
                types.push({ name: typeName, path: typePath });
              }
            }
          }
        }

        if (types.length > 0) {
          const functionName = node.expression.text;
          functionInfos.push({ functionName, types });
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return functionInfos;
}
