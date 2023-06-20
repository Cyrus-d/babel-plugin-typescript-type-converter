/* eslint-disable require-unicode-regexp */
/* eslint-disable no-console */
/* eslint-disable no-magic-numbers */
import debounce from 'lodash/debounce';
import * as ts from 'typescript';
import glob from 'fast-glob';
import path from 'path';
import {
  FileMap,
  getSourceFileTransformerFuncTypes,
  getTsCompilerOptions,
  getWatcher,
  resolveRelativePath,
  setUpdateCacheFileContent,
  sourceFileCacheInstance,
} from './utils';
import { PluginOptions } from './types';
import { ConfigAPI } from './typings';

let INITIALIZED = false;

type FilePathsThatReferencedType = FileMap<string, true>;
type TransformerFuncTypesFiles = FileMap<string, true>;

const typesFilePaths = new FileMap<string, FilePathsThatReferencedType>();

const transformerFuncFilesAndTypes = new FileMap<string, TransformerFuncTypesFiles>();

const onFileChangeDenounced = debounce((event: string, root: string, filePath: string) => {
  if (event === 'unlink' || event === 'unlinkDir') {
    return;
  }

  if (typesFilePaths.has(filePath)) {
    sourceFileCacheInstance.updateSourceFileByPath(filePath);
    console.log('---------onFileChangeDenounced-----------');
    console.log(filePath);
    console.log(typesFilePaths.get(filePath));
    console.log('-----------------------------------------');
    setUpdateCacheFileContent(root, { timestamp: Date.now() });
  }
}, 500);

const onTransformerFileDelete = debounce((path: string) => {
  const transformerTypesFiles = transformerFuncFilesAndTypes.get(path);
  if (transformerTypesFiles) {
    transformerTypesFiles.keys().forEach((typePath) => {
      const typePathTransformerFuncFiles = typesFilePaths.get(typePath);
      if (typePathTransformerFuncFiles) {
        typePathTransformerFuncFiles.delete(path);
      }
    });
  }
  transformerFuncFilesAndTypes.delete(path);
}, 500);

const watchFilesWithTransformerTypesType = (projectRootPath: string, filePath: string) => {
  const watcher = getWatcher(filePath);
  watcher.on('all', (ev, file) => onFileChangeDenounced(ev, projectRootPath, file));
};

const watchTransformerFiles = (filePath: string) => {
  const watcher = getWatcher(filePath);

  watcher.on('unlink', () => onTransformerFileDelete(filePath));
  watcher.on('unlinkDir', () => onTransformerFileDelete(filePath));
};

function setTypeToTransformerMap(typeFilePath: string, referencedFilePath: string) {
  if (!typesFilePaths.has(typeFilePath)) {
    typesFilePaths.set(typeFilePath, new FileMap());
  }

  const referencedTypes = typesFilePaths.get(typeFilePath);

  if (referencedTypes?.has(typeFilePath)) return;

  referencedTypes!.set(referencedFilePath, true);
}

const processSourceFile = (
  projectRootPath: string,
  sourceFiles: readonly ts.SourceFile[] | ts.SourceFile[],
  sourceFile: ts.SourceFile,
) => {
  const sourceFilePath = path.resolve(projectRootPath, sourceFile.fileName);

  const transformerFuncTypesSourceFiles = getSourceFileTransformerFuncTypes(
    projectRootPath,
    sourceFiles,
    sourceFile,
  );

  const hasTransformerTypes = transformerFuncTypesSourceFiles.length > 0;

  if (hasTransformerTypes) {
    const transformerFuncTypesFilePaths = new FileMap() as TransformerFuncTypesFiles;

    transformerFuncTypesSourceFiles.forEach((transformerFuncTypesSourceFile, i) => {
      const transformerFuncTypesSourceFilePath = resolveRelativePath(
        sourceFilePath,
        transformerFuncTypesSourceFile.fileName,
      );

      transformerFuncTypesFilePaths.set(transformerFuncTypesSourceFilePath, true);

      if (!typesFilePaths.has(transformerFuncTypesSourceFilePath)) {
        watchFilesWithTransformerTypesType(projectRootPath, transformerFuncTypesSourceFilePath);
      }

      setTypeToTransformerMap(transformerFuncTypesSourceFilePath, sourceFilePath);
    });

    transformerFuncFilesAndTypes.set(sourceFilePath, transformerFuncTypesFilePaths);
    watchTransformerFiles(sourceFilePath);
  }

  return hasTransformerTypes;
};

export const processFilePath = (root: string, filepath: string) => {
  const sourceFileCache = sourceFileCacheInstance.createOrUpdateSourceFile(filepath, true);
  if (sourceFileCache) {
    processSourceFile(root, sourceFileCacheInstance.getAllSourceFiles(), sourceFileCache);
  }
};

export const initializeFileWatcher = (api: ConfigAPI, root: string, options: PluginOptions) => {
  if (!INITIALIZED) {
    const { ignore = [] } = options;

    INITIALIZED = true;

    const files = glob.sync('**/*.{ts,tsx}', { cwd: root, ignore: ['node_modules/**', ...ignore] });

    const program = ts.createProgram(files, getTsCompilerOptions());

    const sourceFiles = program.getSourceFiles();

    // let cnt = 0;
    sourceFiles.forEach((sourceFile) => {
      const sourceFilePath = path.resolve(root, sourceFile.fileName);
      sourceFileCacheInstance.addSourceFile(sourceFilePath, sourceFile);
    });

    sourceFiles.forEach((sourceFile) => {
      processSourceFile(root, sourceFiles, sourceFile);
    });
  }
};
