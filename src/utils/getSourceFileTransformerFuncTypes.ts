/* eslint-disable no-magic-numbers */
import ts from 'typescript';
import path from 'path';
import { findConverterFunctionData } from './find-converter-function-data';
import * as converterFuncNames from '../constants/convert-functions';
import { resolveRelativePath } from './resolveRelativePath';
import { findExportedInterfacesAndTypes } from './findExportedInterfacesAndTypes';

const convertFuncNamesArr = Object.values(converterFuncNames);

export const getSourceFileTransformerFuncTypes = (
  root: string,
  sourceFiles: readonly ts.SourceFile[],
  sourceFile: ts.SourceFile,
) => {
  const sourceFilePath = path.resolve(root, sourceFile.fileName);

  const transformerFuncData = findConverterFunctionData(sourceFile, convertFuncNamesArr);

  const transformerFuncTypesSourceFiles: ts.SourceFile[] = [];

  if (transformerFuncData.length > 0) {
    transformerFuncData.forEach(({ types: transformerFuncTypes }) => {
      transformerFuncTypes.forEach(({ path: typePath, name: typeName }) => {
        if (typePath) {
          const typeAbsolutePath = resolveRelativePath(sourceFilePath, typePath);

          const typeSourceFiles = sourceFiles.filter((x) =>
            resolveRelativePath(sourceFilePath, x.fileName).startsWith(typeAbsolutePath),
          );

          typeSourceFiles.forEach((typeSourceFile) => {
            const typeSourceFileTypes = findExportedInterfacesAndTypes(typeSourceFile);
            if (
              typeSourceFileTypes.includes(typeName) &&
              !transformerFuncTypesSourceFiles.includes(typeSourceFile)
            ) {
              transformerFuncTypesSourceFiles.push(typeSourceFile);
            }
          });
        }
      });
    });
  }

  return transformerFuncTypesSourceFiles;
};
