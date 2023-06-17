import * as ts from 'typescript';
import { sourceFileCacheInstance } from './SourceFileCache';
import { getTsCompilerOptions } from './get-ts-compiler-options';

export const createProgram = (filePath: string) => {
  const tsconfig = getTsCompilerOptions();
  const program = ts.createProgram([filePath], tsconfig, {
    fileExists(fileName): boolean {
      if (!fileName.endsWith('.ts') && !fileName.endsWith('.tsx')) return false;

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
