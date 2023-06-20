/* eslint-disable no-restricted-syntax */
import * as ts from 'typescript';

export function isFileOwnType(file: ts.SourceFile, typeName: string): boolean {
  // Check if the type is declared within the file
  const ownTypeDeclaration = file.statements.find((statement) => {
    if (ts.isTypeAliasDeclaration(statement) && statement.name.text === typeName) {
      return true;
    }
    if (ts.isInterfaceDeclaration(statement) && statement.name.text === typeName) {
      return true;
    }
    if (ts.isClassDeclaration(statement) && statement.name?.text === typeName) {
      return true;
    }

    return false;
  });

  if (ownTypeDeclaration) {
    return true;
  }

  return false;
}
