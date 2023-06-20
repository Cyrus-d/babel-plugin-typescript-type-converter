import ts from 'typescript';
import { getAllTypeIntersections } from './getAllTypeIntersections';
import { getImportInfoByImportNames } from './getImportInfoByImportNames';
import { findSourceFileByFileNameAndType } from './findSourceFileByFileNameAndType';
import { isFileOwnType } from './isFileOwnType';

export const getImportPath = (node: any) => {
  const { text } = node.moduleSpecifier as any;
  const importPath = text.slice(1, -1); // R

  return importPath;
};

export function getAllConnectedSourceFilesByType(
  projectRootPath: string,
  sourceFiles: readonly ts.SourceFile[],
  sourceFile: ts.SourceFile,
  typeName: string,
): ts.SourceFile[] {
  let connectedFiles: ts.SourceFile[] = [];

  const intersectionsTypes = getAllTypeIntersections(sourceFile, typeName);
  const typesImportInfo = getImportInfoByImportNames(sourceFile, intersectionsTypes);

  typesImportInfo.forEach(({ file: typePath, name: typeName }) => {
    const typeSourceFile = findSourceFileByFileNameAndType(
      projectRootPath,
      sourceFiles,
      sourceFile,
      typePath,
      typeName,
    );

    if (typeSourceFile) {
      if (isFileOwnType(typeSourceFile, typeName)) {
        connectedFiles.push(typeSourceFile);
      }

      const connectedTypes = getAllConnectedSourceFilesByType(
        projectRootPath,
        sourceFiles,
        typeSourceFile,
        typeName,
      );

      if (connectedTypes.length > 0) {
        connectedFiles = [...connectedFiles, ...connectedTypes];
      }
    }
  });

  return connectedFiles;
}
