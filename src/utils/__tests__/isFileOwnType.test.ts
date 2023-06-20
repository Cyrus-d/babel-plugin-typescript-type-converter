import * as ts from 'typescript';
import { isFileOwnType } from '../isFileOwnType'; // Replace './your-file' with the actual path to your file containing the `isFileOwnType` function

describe('isFileOwnType', () => {
  test('should return true if the type is declared within the file', () => {
    const sourceCode = `
      type Foo = {};

      export Foo;
    `;
    const sourceFile = ts.createSourceFile('test.ts', sourceCode, ts.ScriptTarget.ES2015);

    const result = isFileOwnType(sourceFile, 'Foo');
    expect(result).toBe(true);
  });

  test('should return false if the type is imported from another file', () => {
    const sourceCode = `
      import { Foo } from './other-file';
      export Foo;
    `;
    const sourceFile = ts.createSourceFile('test.ts', sourceCode, ts.ScriptTarget.ES2015);

    const result = isFileOwnType(sourceFile, 'Foo');
    expect(result).toBe(false);
  });

  test('should return false if the type is imported from another file with type alias', () => {
    const sourceCode = `
      import { Boo as Foo } from './other-file';
      export Foo;
    `;
    const sourceFile = ts.createSourceFile('test.ts', sourceCode, ts.ScriptTarget.ES2015);

    const result = isFileOwnType(sourceFile, 'Foo');
    expect(result).toBe(false);
  });
});
