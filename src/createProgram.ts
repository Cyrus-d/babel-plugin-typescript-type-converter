import * as ts from 'typescript';
import { getTsCompilerOptions } from './utils';
import { sourceFileCache } from './SourceFileCache';

export const createProgram = (filePath: string) => {
  const tsconfig = getTsCompilerOptions();
  const program = ts.createProgram([filePath], tsconfig, {
    fileExists(fileName): boolean {
      if (!fileName.endsWith('.ts') && !fileName.endsWith('.tsx')) return false;

      const file = sourceFileCache.createOrUpdateSourceFile(fileName);
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
      return sourceFileCache.createOrUpdateSourceFile(fileName);
    },
    readFile(fileName: string): string {
      const src = sourceFileCache.createOrUpdateSourceFile(fileName);
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
