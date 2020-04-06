import * as ts from 'typescript';
import { getCompilerOptions, sourceFileCacheInstance } from './SourceFileCache';

export const createProgram = (filePath: string) => {
  const tsconfig = getCompilerOptions();
  const program = ts.createProgram([filePath], tsconfig, {
    fileExists(fileName): boolean {
      const file = sourceFileCacheInstance.createOrUpdateSourceFile(fileName);
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
      return sourceFileCacheInstance.createOrUpdateSourceFile(fileName);
    },
    readFile(fileName: string): string {
      const src = sourceFileCacheInstance.createOrUpdateSourceFile(fileName);
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
