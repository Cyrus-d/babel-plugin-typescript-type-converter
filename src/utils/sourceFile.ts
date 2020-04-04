import * as fs from 'fs';
import * as ts from 'typescript';
import { createProgram, Config } from 'ts-to-json';
import path from 'path';
import { getFileKey } from '.';
import { getModuleDependencies } from './moduleDependencies';
import { watchNodeModules } from './watchNodeModules';

interface SourceFileObject {
  [key: string]: ts.SourceFile | null;
}
let sourceFilesCache: SourceFileObject;

let tsconfig: ts.CompilerOptions = {
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  module: ts.ModuleKind.CommonJS,
  noEmit: true,
  strictNullChecks: false,
  target: ts.ScriptTarget.ES5,
};

export const getCompilerOptions = () => {
  return tsconfig;
};

const getSourceFileText = (fileName: string) => {
  if (!fs.existsSync(fileName)) return null;

  return fs.readFileSync(fileName, 'utf8');
};

export const getSourceFile = (fileKey: string, isAbsolutePath?: boolean) => {
  if (sourceFilesCache[fileKey] !== undefined || isAbsolutePath) {
    return sourceFilesCache[fileKey];
  }

  // if no absolute path and only file name like lib.dom.iterable.d.ts
  const file = Object.keys(sourceFilesCache).find(x => x.endsWith(fileKey));

  if (file) {
    // for performance changing key, so next time no need to search
    sourceFilesCache[fileKey] = sourceFilesCache[file];

    return sourceFilesCache[file];
  }

  // probably source file never going to be available, so set it to null to prevent search for it again
  sourceFilesCache[fileKey] = null;

  return undefined;
};

export const createOrUpdateSourceFile = (
  fileName: string,
  forceUpdateIfDiff?: boolean,
  ignoreDiffCheck?: boolean,
) => {
  const fileKey = getFileKey(fileName);

  const sourceFileCache = getSourceFile(fileKey, path.isAbsolute(fileName));

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

  const sourceFile = ts.createSourceFile(fileName, text, tsconfig.target!, true, ts.ScriptKind.TS);
  sourceFilesCache[fileKey] = sourceFile;

  watchNodeModules(fileName);

  return sourceFile;
};

const initialize = (config: Config, fileName: string) => {
  if (config.path === undefined) config.path = fileName;
  if (config.skipTypeCheck === undefined) config.skipTypeCheck = true;
  sourceFilesCache = {};
  const program = createProgram(config);
  sourceFilesCache = program.getSourceFiles().reduce((obj, sourceFile) => {
    const fileKey = getFileKey(sourceFile.fileName);
    obj[fileKey] = sourceFile;
    watchNodeModules(sourceFile.fileName);

    return obj;
  }, {} as SourceFileObject);

  tsconfig = program.getCompilerOptions();
};

export const updateSourceFileByPath = (
  filePath: string,
  config?: Config,
  forceUpdate?: boolean,
) => {
  if (!sourceFilesCache && config) {
    initialize(config, filePath);

    return;
  }

  /*
    When an update triggered by updateReferences, the SourceFile of reference file not updating,
    and it should updated in here.
  */

  const deps = getModuleDependencies(filePath);

  if (deps) {
    deps.forEach(d => {
      if (!d.includes('node_modules') && path.isAbsolute(d)) {
        createOrUpdateSourceFile(d, true, forceUpdate);
      }
    });
  } else {
    createOrUpdateSourceFile(filePath, true, forceUpdate);
  }
};

export const getAllSourceFiles = () => {
  return sourceFilesCache;
};
