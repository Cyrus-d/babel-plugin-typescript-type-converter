import * as ts from 'typescript';
import { getImportedTypes } from '../getImportedTypes';

describe('getImportedTypes', () => {
  test('should return Bar import data when connected to Foo', () => {
    const sourceFile = ts.createSourceFile(
      'testFile1.ts',
      `
      import { Bar } from './file1';
      import { Baz } from './file2';
      import { Other } from './file2';

      export type Foo = Baz & Bar;
      export type SomeOtherType = Other & Foo;
      `,
      ts.ScriptTarget.ESNext,
    );

    const importedTypes = getImportedTypes(sourceFile, 'Foo');
    expect(importedTypes).toEqual([{ importedTypeName: 'Bar', importFileName: './file1' }]);
  });

  // test('should return Baz&Bar import data when connected to Foo', () => {
  //   const sourceFile = ts.createSourceFile(
  //     'testFile2.ts',
  //     `
  //     import { Foo } from './file1';

  //     export { Foo };
  //     `,
  //     ts.ScriptTarget.ESNext,
  //   );

  //   const importedTypes = getImportedTypes(sourceFile, 'Foo');
  //   expect(importedTypes).toEqual([
  //     { importedTypeName: 'Bar', importFileName: './file1' },
  //     { importedTypeName: 'Baz', importFileName: './file2' },
  //   ]);
  // });

  // test('should return import data for Foo', () => {
  //   const sourceFile = ts.createSourceFile(
  //     'testFile3.ts',
  //     `
  //     import { Bar } from './file1';
  //     import { Baz } from './file2';

  //     export interface Foo extends Bar, Baz {

  //     }
  //     `,
  //     ts.ScriptTarget.ESNext,
  //   );

  //   const importedTypes = getImportedTypes(sourceFile, 'Foo');
  //   expect(importedTypes).toEqual([{ importedTypeName: 'Foo', importFileName: './file1' }]);
  // });

  // test('should return Baz&Bar import data when extended by Foo', () => {
  //   const sourceFile = ts.createSourceFile(
  //     'testFile4.ts',
  //     `
  //     import { Bar } from './file1';
  //     import { Baz } from './file2';

  //     export interface Foo extends Baz, Bar {

  //     }
  //     `,
  //     ts.ScriptTarget.ESNext,
  //   );

  //   const importedTypes = getImportedTypes(sourceFile, 'Foo');
  //   expect(importedTypes).toEqual([
  //     { importedTypeName: 'Bar', importFileName: './file1' },
  //     { importedTypeName: 'Baz', importFileName: './file2' },
  //   ]);
  // });
});
