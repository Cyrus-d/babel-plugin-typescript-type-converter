import * as ts from 'typescript';
import path from 'path';
import glob from 'fast-glob';
import { FileMap, getSourceFileText, getTsCompilerOptions } from './utils';
import { PluginOptionsInternal } from './types';

const tsconfig: ts.CompilerOptions = getTsCompilerOptions();

class SourceFileCache {
  sourceFilesCache!: FileMap<string, ts.SourceFile | null>;

  initialize = (options: PluginOptionsInternal) => {
    this.sourceFilesCache = new FileMap(options);

    const { ignore = [], root } = options;

    const files = glob.sync('**/*.{ts,tsx}', { cwd: root, ignore: ['node_modules/**', ...ignore] });

    const program = ts.createProgram(files, getTsCompilerOptions());

    const sourceFiles = program.getSourceFiles();

    // let cnt = 0;
    sourceFiles.forEach((sourceFile) => {
      const sourceFilePath = path.resolve(root, sourceFile.fileName);
      this.addSourceFile(sourceFilePath, sourceFile);
    });
  };

  addSourceFile(fileKey: string, sourceFile: ts.SourceFile) {
    this.sourceFilesCache.set(fileKey, sourceFile);
  }

  initialized = () => this.sourceFilesCache !== undefined;

  getSourceFile = (fileKey: string, isAbsolutePath?: boolean) => {
    const { sourceFilesCache } = this;

    const fromCache = sourceFilesCache.get(fileKey);

    if (fromCache !== undefined || isAbsolutePath) {
      return fromCache;
    }

    // // if no absolute path and only file name like lib.dom.iterable.d.ts
    // const searchResultFilePath = Object.keys(sourceFilesCache).find((x) => x.endsWith(fileKey));

    // if (searchResultFilePath) {
    //   // for performance changing key, so next time no need to search
    //   sourceFilesCache.set(fileKey, sourceFilesCache.get(searchResultFilePath)!);

    //   return sourceFilesCache.get(searchResultFilePath);
    // }

    // sourceFilesCache.set(fileKey, null);

    return undefined;
  };

  createOrUpdateSourceFile = (
    fileName: string,
    forceUpdateIfDiff?: boolean,
    ignoreDiffCheck?: boolean,
  ) => {
    const sourceFileCache = this.getSourceFile(fileName, path.isAbsolute(fileName));

    if (!forceUpdateIfDiff) {
      if (sourceFileCache) {
        return sourceFileCache;
      }
    }

    const text = getSourceFileText(fileName);

    if (text === null) return undefined;

    // nothing to update
    if (!ignoreDiffCheck && sourceFileCache && sourceFileCache.text === text) {
      return sourceFileCache;
    }

    const sourceFile = ts.createSourceFile(
      fileName,
      text,
      tsconfig.target!,
      true,
      ts.ScriptKind.TS,
    );

    this.sourceFilesCache.set(fileName, sourceFile);

    return sourceFile;
  };

  getAllSourceFiles = (): ts.SourceFile[] => {
    return Object.values(this.sourceFilesCache).filter((x) => x !== null) as ts.SourceFile[];
  };

  updateSourceFileByPath = (filePath: string, forceUpdate?: boolean) => {
    // now update SourceFile of file itself
    this.createOrUpdateSourceFile(filePath, true, forceUpdate);
  };
}

const sourceFileCache = new SourceFileCache();

export { sourceFileCache, SourceFileCache };
