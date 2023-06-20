import ts from 'typescript';
import { findSourceFileByFileNameAndType } from '../findSourceFileByFileNameAndType';

describe('findSourceFileByFileNameAndType', () => {
  const root = '/path/to/root';
  const baseSourceFile = ts.createSourceFile('base.ts', '', ts.ScriptTarget.Latest);
  const sourceFiles = [
    ts.createSourceFile('file1.ts', '', ts.ScriptTarget.Latest),
    ts.createSourceFile('file2.ts', '', ts.ScriptTarget.Latest),
    ts.createSourceFile('file3.ts', '', ts.ScriptTarget.Latest),
  ];

  it('should return undefined if no matching source file is found', () => {
    const result = findSourceFileByFileNameAndType(
      root,
      sourceFiles,
      baseSourceFile,
      'type/path',
      'typeName',
    );

    expect(result).toBeUndefined();
  });

  it('should return the matching source file if found', () => {
    const typeSourceFile = ts.createSourceFile(
      'type/path/file.ts',
      'export type typeName={}',
      ts.ScriptTarget.Latest,
    );

    sourceFiles.push(typeSourceFile);

    const result = findSourceFileByFileNameAndType(
      root,
      sourceFiles,
      baseSourceFile,
      './type/path',
      'typeName',
    );

    expect(result?.fileName).toBe(typeSourceFile.fileName);
  });
});
