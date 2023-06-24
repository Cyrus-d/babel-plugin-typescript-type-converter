import * as ts from 'typescript';
// import { createProgram, Config } from 'ts-to-json';
import path from 'path';
import glob from 'fast-glob';

// import { getModuleDependencies } from './moduleDependencies';
// import { watchNodeModules } from './watchNodeModules';
// import { getSourceFileText } from './getSourceFileText';
import { getSourceFileText, getTsCompilerOptions, normalizeFilePath } from './utils';
import { PluginOptionsInternal } from './types';

interface SourceFileObject {
  [key: string]: ts.SourceFile | null;
}

const tsconfig: ts.CompilerOptions = getTsCompilerOptions();

class SourceFileCache {
  sourceFilesCache: SourceFileObject | undefined;

  initialize = (options: PluginOptionsInternal) => {
    this.sourceFilesCache = {};

    const { ignore = [], root } = options;

    const files = glob.sync('**/*.{ts,tsx}', { cwd: root, ignore: ['node_modules/**', ...ignore] });

    const program = ts.createProgram(files, tsconfig);

    const sourceFiles = program.getSourceFiles();
    // console.log(files);
    // let cnt = 0;
    sourceFiles.forEach((sourceFile) => {
      const sourceFilePath = path.resolve(root, sourceFile.fileName);
      this.addSourceFile(sourceFilePath, sourceFile);
    });
  };

  addSourceFile(fileName: string, sourceFile: ts.SourceFile) {
    const fileKey = normalizeFilePath(fileName);

    this.sourceFilesCache = { ...this.sourceFilesCache, [fileKey]: sourceFile };
  }

  getSourceFile = (fileName: string, isAbsolutePath?: boolean) => {
    const fileKey = normalizeFilePath(fileName);
    if (!this.sourceFilesCache) return undefined;
    const { sourceFilesCache } = this;

    if (sourceFilesCache[fileKey] !== undefined || isAbsolutePath) {
      return sourceFilesCache[fileKey];
    }

    // if no absolute path and only file name like lib.dom.iterable.d.ts
    const file = Object.keys(sourceFilesCache).find((x) => x.endsWith(fileKey));

    if (file) {
      // for performance changing key, so next time no need to search
      sourceFilesCache[fileKey] = sourceFilesCache[file];

      return sourceFilesCache[file];
    }

    // probably source file never going to be available, so set it to null to prevent search for it again
    sourceFilesCache[fileKey] = null;

    return undefined;
  };

  createOrUpdateSourceFile = (
    fileName: string,
    forceUpdateIfDiff?: boolean,
    ignoreDiffCheck?: boolean,
  ) => {
    if (!this.sourceFilesCache) return undefined;
    const fileKey = normalizeFilePath(fileName);

    const sourceFileCache = this.getSourceFile(fileKey, path.isAbsolute(fileName));

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
    this.sourceFilesCache[fileKey] = sourceFile;

    // watchNodeModules(fileName);

    return sourceFile;
  };

  getAllSourceFiles = () => {
    return this.sourceFilesCache;
  };

  updateSourceFileByPath = (filePath: string, forceUpdate?: boolean) => {
    /*
      When an update triggered by updateReferences, the SourceFile of reference file not updating,
      and it should updated in here.
    */

    // const deps = getModuleDependencies(filePath);

    // if (deps) {
    //   deps.forEach((d) => {
    //     if (!d.includes('node_modules') && path.isAbsolute(d)) {
    //       this.createOrUpdateSourceFile(d, true, forceUpdate);
    //     }
    //   });
    // }

    // now update SourceFile of file itself
    this.createOrUpdateSourceFile(filePath, true, forceUpdate);
  };
}

export const sourceFileCache = new SourceFileCache();

export { SourceFileCache };
