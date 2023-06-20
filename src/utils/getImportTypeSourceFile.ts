// /* eslint-disable no-restricted-syntax */
// import ts from 'typescript';

// export const getImportTypeSourceFile = (
//   sourceFiles: readonly ts.SourceFile[],
//   sourceFile: ts.SourceFile,
//   typeName: string,
// ) => {
//   const importDeclarations = sourceFile.statements.filter(ts.isImportDeclaration);
//   for (const importDeclaration of importDeclarations) {
//     const { importClause } = importDeclaration;
//     if (
//       importClause &&
//       importClause.namedBindings &&
//       ts.isNamedImports(importClause.namedBindings)
//     ) {
//       const namedImports = importClause.namedBindings.elements;
//       for (const namedImport of namedImports) {
//         if (namedImport.name.text === typeName) {
//           return importClause;
//         }
//       }
//     }
//   }
// };
