/* eslint-disable no-magic-numbers */
import { watch } from 'chokidar';
import debounce from 'lodash/debounce';
import * as ts from 'typescript';
import glob from 'fast-glob';
import path from 'path';
import fs from 'fs';
import {
  getSourceFileTransformerFuncTypes,
  getTsCompilerOptions,
  resolveRelativePath,
  sourceFileCacheInstance,
} from './utils';

// interface WatchingFile {
//   [filePathThatReferencedType: string]: true;
// }

type FilePathsThatReferencedType = string[];

const typesFilePaths = new Map<string, FilePathsThatReferencedType>();

const onFileChange = (event: string, path: string) => {
  if (event === 'unlink' || event === 'unlinkDir') {
    // sometime cause problem when updating package, because file will be removed first than replaced
    // deleteModuleReference(path);
  }

  if (typesFilePaths.has(path)) {
    sourceFileCacheInstance.updateSourceFileByPath(path);
    typesFilePaths.get(path)!.forEach((filePathWithTransformerFunc) => {
      fs.utimes(filePathWithTransformerFunc, new Date(), new Date(), (err) => {
        if (err) console.error(`[typescript-type-transformer]${err}`);
      });

      fs.appendFile(
        filePathWithTransformerFunc,
        // `//babel-typescript-type-transformer:updateTimeStamp=${Date.now()}`,
        `//typescript-type-transformer:update=${Date.now()}\n`,
        (err) => {
          if (err) {
            console.error(`[typescript-type-transformer]${err}`);
          }
        },
      );

      // fs.readFile(filePathWithTransformerFunc, 'utf8', (err, data) => {
      //   if (err) {
      //     console.error('Error reading file:', err);

      //     return;
      //   }

      //   // Remove lines that start with '//typescript-type-transformer'
      //   // eslint-disable-next-line require-unicode-regexp
      //   const updatedData = data.replace(/^\/\/typescript-type-transformer.*$/gm, '');

      //   fs.writeFile(filePathWithTransformerFunc, updatedData, 'utf8', (err) => {
      //     if (err) {
      //       console.error('Error writing to file:', err);

      //       return;
      //     }

      //     console.log('Lines removed successfully!');
      //   });
      // });
    });
  }
  // sourceFileCacheInstance.createOrUpdateSourceFile(path, true);
  // updateReferences(path);
};

const onFileChangeDenounced = debounce(onFileChange, 100);

export const watchFile = (filePath: string) => {
  const watcher = watch(filePath, {
    awaitWriteFinish: {
      pollInterval: 100,
      stabilityThreshold: 1000,
    },
    disableGlobbing: true,
    ignoreInitial: true,
  });

  watcher.on('all', onFileChangeDenounced);
};

function addReferencedFilePath(typeFilePath: string, referencedFilePath: string) {
  if (!typesFilePaths.has(typeFilePath)) {
    typesFilePaths.set(typeFilePath, []);
  }

  const referencedTypes = typesFilePaths.get(typeFilePath);
  referencedTypes!.push(referencedFilePath);
}

export const initializeFileWatcher = (root: string) => {
  const files = glob.sync('**/*.{ts,tsx}', { ignore: ['node_modules/**'] });
  const program = ts.createProgram(files, getTsCompilerOptions());

  const sourceFiles = program.getSourceFiles();

  sourceFiles.forEach((sourceFile) => {
    const sourceFilePath = path.resolve(root, sourceFile.fileName);

    sourceFileCacheInstance.addSourceFile(sourceFilePath, sourceFile);

    const transformerFuncTypesSourceFiles = getSourceFileTransformerFuncTypes(
      root,
      sourceFiles,
      sourceFile,
    );

    if (transformerFuncTypesSourceFiles.length > 0) {
      transformerFuncTypesSourceFiles.forEach((transformerFuncTypesSourceFile) => {
        const transformerFuncTypesSourceFilePath = resolveRelativePath(
          sourceFilePath,
          transformerFuncTypesSourceFile.fileName,
        );

        watchFile(transformerFuncTypesSourceFilePath);

        addReferencedFilePath(transformerFuncTypesSourceFilePath, sourceFilePath);
      });
    }
  });
};

export const removeTriggerStringFormFile = (filename: string) => {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);

      return;
    }

    // Remove lines that start with '//typescript-type-transformer'
    // eslint-disable-next-line require-unicode-regexp
    const updatedData = data.replace(/^\/\/typescript-type-transformer.*$/gm, '');

    fs.writeFile(filename, updatedData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      }
    });
  });
};
