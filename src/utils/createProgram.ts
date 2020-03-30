import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

const tsconfig: ts.CompilerOptions = {
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  module: ts.ModuleKind.CommonJS,
  noEmit: true,
  strictNullChecks: false,
  target: ts.ScriptTarget.ES5,
};

const fixFileName = (fileName: string) => fileName.split('/').join('\\');

const cacheProgram = ts.createProgram([''], tsconfig);

const cacheSourceFiles = cacheProgram.getSourceFiles().reduce((obj, sourceFile) => {
  obj[sourceFile.fileName] = sourceFile;

  return obj;
}, {} as SourceFileObject);

const getSourceFile = (fileName: string) => {
  if (path.isAbsolute(fileName)) {
    return cacheSourceFiles[fileName];
  }

  const file = Object.keys(cacheSourceFiles).find(x => x.endsWith(fileName));
  if (file) return cacheSourceFiles[file];

  return undefined;
};

interface SourceFileObject {
  [key: string]: ts.SourceFile;
}

const getSourceFileText = (fileName: string) => {
  if (!fs.existsSync(fileName)) return null;

  return fs.readFileSync(fileName, 'utf8');
};

const createSourceFile = (fileName: string, requestedFileName?: string, forceUpdate?: boolean) => {
  fileName = fixFileName(fileName);
  if (!forceUpdate) {
    const sourceFile = getSourceFile(fileName);
    if (sourceFile) {
      return sourceFile;
    }
  }

  const text = getSourceFileText(fileName);
  if (text === null) return undefined;
  const sourceFile = ts.createSourceFile(fileName, text, tsconfig.target!, true, ts.ScriptKind.TS);
  cacheSourceFiles[fileName] = sourceFile;

  return sourceFile;
};

export const updateSourceFileByPath = (path: string) => {
  createSourceFile(path, undefined, true);
};

export const createProgram = (filePath: string, propName: string) => {
  const program = ts.createProgram([filePath], tsconfig, {
    fileExists(fileName): boolean {
      const file = createSourceFile(fileName, filePath);
      if (!file) {
        return false;
      }

      return true;
    },
    getCanonicalFileName(_fileName: string): string {
      return _fileName;
    },
    getCurrentDirectory(): string {
      return '';
    },
    getDefaultLibFileName(): string {
      return ts.getDefaultLibFileName(tsconfig);
    },

    getNewLine(): string {
      return '\r\n';
    },
    getSourceFile(fileName): ts.SourceFile | undefined {
      return createSourceFile(fileName, filePath);
    },
    readFile(fileName: string): string {
      const src = createSourceFile(fileName, filePath);
      if (!src) return '';

      return src.text;
    },
    useCaseSensitiveFileNames(): boolean {
      return false;
    },
    writeFile: (_fileName, _content) => null,
  });

  return program;
};
