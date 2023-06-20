/* eslint-disable no-magic-numbers */
import ts from 'typescript';
import { findConverterFunctionData } from './find-converter-function-data';
import { findSourceFileByFileNameAndType } from './findSourceFileByFileNameAndType';
import { getAllConnectedSourceFilesByType } from './getAllConnectedSourceFilesByType';

export const getSourceFileTransformerFuncTypes = (
  projectRootPath: string,
  sourceFiles: readonly ts.SourceFile[],
  sourceFile: ts.SourceFile,
) => {
  const transformerFuncData = findConverterFunctionData(sourceFile);
  const transformerTypesSourceFiles: ts.SourceFile[] = [];

  if (transformerFuncData.length > 0) {
    transformerFuncData.forEach(({ types: transformerFuncTypes }) => {
      transformerFuncTypes.forEach(({ path: typePath, name: typeName }) => {
        if (typePath) {
          const typeSourceFile = findSourceFileByFileNameAndType(
            projectRootPath,
            sourceFiles,
            sourceFile,
            typePath,
            typeName,
          );

          if (typeSourceFile) {
            const allConnectedTypes = getAllConnectedSourceFilesByType(
              projectRootPath,
              sourceFiles,
              typeSourceFile,
              typeName,
            );

            transformerTypesSourceFiles.push(typeSourceFile);

            allConnectedTypes.forEach((connectedType) => {
              if (!transformerTypesSourceFiles.includes(connectedType)) {
                transformerTypesSourceFiles.push(connectedType);
              }
            });
          }
        }
      });
    });
  }

  return transformerTypesSourceFiles;
};
