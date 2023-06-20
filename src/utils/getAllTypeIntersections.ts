import * as ts from 'typescript';

export function getAllTypeIntersections(sourceFile: ts.SourceFile, typeName: string): string[] {
  const typeNames: string[] = [];

  function visitNode(node: ts.Node) {
    if (ts.isTypeAliasDeclaration(node) && node.name && node.name.text === typeName) {
      const typeNode = node.type;
      if (ts.isIntersectionTypeNode(typeNode)) {
        typeNode.types.forEach((type) => {
          if (ts.isTypeReferenceNode(type) && ts.isIdentifier(type.typeName)) {
            typeNames.push(type.typeName.text);
          }
        });
      } else if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
        typeNames.push(typeNode.typeName.text);
      }
    }

    if (ts.isInterfaceDeclaration(node) && node.name && node.name.text === typeName) {
      const { heritageClauses } = node;
      if (heritageClauses) {
        heritageClauses.forEach((clause) => {
          if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
            clause.types.forEach((type) => {
              if (ts.isExpressionWithTypeArguments(type) && ts.isIdentifier(type.expression)) {
                typeNames.push(type.expression.text);
              }
            });
          }
        });
      }
    }

    ts.forEachChild(node, visitNode);
  }

  visitNode(sourceFile);

  return typeNames;
}
