import * as ts from 'typescript';
import { createProgram, Config } from 'ts-to-json';
import path from 'path';
import { getFileKey } from '.';
import { getModuleDependencies } from './moduleDependencies';
import { watchNodeModules } from './watchNodeModules';
import { getSourceFileText } from './getSourceFileText';

interface SourceFileObject {
  [key: string]: ts.SourceFile | null;
}

let tsconfig: ts.CompilerOptions = {
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  module: ts.ModuleKind.CommonJS,
  noEmit: true,
  strictNullChecks: false,
  target: ts.ScriptTarget.ES5,
};

class SourceFileCache {
  sourceFilesCache: SourceFileObject | undefined;

  initializeSourceFiles = (config: Config, fileName: string) => {
    if (config.path === undefined) config.path = fileName;
    if (config.skipTypeCheck === undefined) config.skipTypeCheck = true;
    this.sourceFilesCache = {};
    const program = createProgram(config);
    this.sourceFilesCache = program.getSourceFiles().reduce((obj, sourceFile) => {
      const fileKey = getFileKey(sourceFile.fileName);
      obj[fileKey] = sourceFile as any;
      watchNodeModules(sourceFile.fileName);

      return obj;
    }, {} as SourceFileObject);

    tsconfig = program.getCompilerOptions() as any;
  };

  addSourceFile(fileKey: string, sourceFile: ts.SourceFile) {
    this.sourceFilesCache = { ...this.sourceFilesCache, [fileKey]: sourceFile };
  }

  initialized = () => this.sourceFilesCache !== undefined;

  getSourceFile = (fileKey: string, isAbsolutePath?: boolean) => {
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
    const fileKey = getFileKey(fileName);

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

    watchNodeModules(fileName);

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

    const deps = getModuleDependencies(filePath);

    if (deps) {
      deps.forEach((d) => {
        if (!d.includes('node_modules') && path.isAbsolute(d)) {
          this.createOrUpdateSourceFile(d, true, forceUpdate);
        }
      });
    }

    // now update SourceFile of file itself
    this.createOrUpdateSourceFile(filePath, true, forceUpdate);
  };
}

export const getCompilerOptions = () => {
  return tsconfig;
};

export const sourceFileCacheInstance = new SourceFileCache();

export { SourceFileCache };
