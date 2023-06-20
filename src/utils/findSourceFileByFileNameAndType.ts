import path from 'path';
import ts from 'typescript';
import { resolveRelativePath } from './resolveRelativePath';
import { getAbsolutePathFromBasePath } from './getAbsolutePathFromBasePath';
import { findExportedInterfacesAndTypes } from './findExportedInterfacesAndTypes';

export const findSourceFileByFileNameAndType = (
  projectRootPath: string,
  sourceFiles: readonly ts.SourceFile[],
  baseSourceFile: ts.SourceFile,
  typePath: string,
  typeName: string,
): ts.SourceFile | undefined => {
  const sourceFilePath = path.resolve(projectRootPath, baseSourceFile.fileName);

  const typeAbsolutePath = getAbsolutePathFromBasePath(projectRootPath, sourceFilePath, typePath);

  const typeSourceFiles = sourceFiles.filter((x) =>
    resolveRelativePath(sourceFilePath, x.fileName).startsWith(typeAbsolutePath),
  );

  return typeSourceFiles.find((typeSourceFile) => {
    const typeSourceFileTypes = findExportedInterfacesAndTypes(typeSourceFile);
    if (typeSourceFileTypes.includes(typeName)) {
      return true;
    }

    return false;
  });
};
