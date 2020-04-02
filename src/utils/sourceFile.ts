import * as fs from 'fs';
import * as ts from 'typescript';
import { createProgram, Config } from 'ts-to-json';
import { getFileKey } from '.';

interface SourceFileObject {
  [key: string]: ts.SourceFile;
}
let sourceFilesCache: SourceFileObject;

let tsconfig: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES5,
};

export const getCompilerOptions = () => {
  return tsconfig;
};

export const initiateSourceFile = (config: Config, root: string) => {
  if (config.path === undefined) config.path = root;
  if (config.skipTypeCheck === undefined) config.skipTypeCheck = true;
  const program = createProgram(config);
  sourceFilesCache = program.getSourceFiles().reduce((obj, sourceFile) => {
    const fileKey = getFileKey(sourceFile.fileName);
    obj[fileKey] = sourceFile;

    return obj;
  }, {} as SourceFileObject);

  tsconfig = program.getCompilerOptions();
};

const getSourceFileText = (fileName: string) => {
  if (!fs.existsSync(fileName)) return null;

  return fs.readFileSync(fileName, 'utf8');
};

export const getSourceFile = (fileName: string) => {
  if (sourceFilesCache[fileName]) {
    return sourceFilesCache[fileName];
  }
  // for library names line lib.dom.iterable.d.ts
  const file = Object.keys(sourceFilesCache).find(x => x.endsWith(fileName));
  if (file) return sourceFilesCache[file];

  return undefined;
};

export const createSourceFile = (fileName: string, forceUpdate?: boolean) => {
  const fileKey = getFileKey(fileName);
  if (!forceUpdate) {
    const sourceFile = getSourceFile(fileKey);
    if (sourceFile) {
      return sourceFile;
    }
  }

  const text = getSourceFileText(fileName);
  if (text === null) return undefined;
  const sourceFile = ts.createSourceFile(fileName, text, tsconfig.target!, true, ts.ScriptKind.TS);
  sourceFilesCache[fileKey] = sourceFile;

  return sourceFile;
};

export const updateSourceFileByPath = (config: Config, path: string) => {
  if (!sourceFilesCache) {
    initiateSourceFile(config, path);
  }
  createSourceFile(path, true);
};
