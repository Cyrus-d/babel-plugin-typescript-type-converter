import * as ts from 'typescript';
import { getImportInfoByImportNames } from '../getImportInfoByImportNames';

describe('getImportedInfoByName', () => {
  const sourceCode = `
    import { Foo } from './file1';
    import { Bar } from './file2';
    import { Baz } from './file3';
  `;

  const sourceFile = ts.createSourceFile('example.ts', sourceCode, ts.ScriptTarget.Latest, true);

  it('returns the imported info for a single named import', () => {
    const namedImports = ['Foo'];
    const importedInfo = getImportInfoByImportNames(sourceFile, namedImports);

    expect(importedInfo).toEqual([{ name: 'Foo', file: './file1' }]);
  });

  it('returns the imported info for multiple named imports', () => {
    const namedImports = ['Foo', 'Baz'];
    const importedInfo = getImportInfoByImportNames(sourceFile, namedImports);

    expect(importedInfo).toEqual([
      { name: 'Foo', file: './file1' },
      { name: 'Baz', file: './file3' },
    ]);
  });

  it('returns an empty array when no matching named imports are found', () => {
    const namedImports = ['Qux'];
    const importedInfo = getImportInfoByImportNames(sourceFile, namedImports);

    expect(importedInfo).toEqual([]);
  });

  it('returns an empty array when the source file has no import declarations', () => {
    const emptySourceCode = '';
    const emptySourceFile = ts.createSourceFile(
      'empty.ts',
      emptySourceCode,
      ts.ScriptTarget.Latest,
      true,
    );
    const namedImports = ['Foo'];
    const importedInfo = getImportInfoByImportNames(emptySourceFile, namedImports);

    expect(importedInfo).toEqual([]);
  });
});
