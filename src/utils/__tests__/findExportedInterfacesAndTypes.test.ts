import * as ts from 'typescript';
import { findExportedInterfacesAndTypes } from '../findExportedInterfacesAndTypes';

describe('findExportedInterfacesAndTypes', () => {
  it('should return the exported interfaces and types', () => {
    // Example TypeScript source code
    const sourceCode = `
      export interface MyInterface {
        // interface properties...
      }

      export type MyType = string;

      interface NotExportedInterface {
        // interface properties...
      }

      type NotExportedType = number;
    `;

    // Create a TypeScript source file from the source code
    const sourceFile = ts.createSourceFile('test.ts', sourceCode, ts.ScriptTarget.Latest);

    // Call the function and get the result
    const exportedSymbols = findExportedInterfacesAndTypes(sourceFile);

    // Expected result
    const expectedSymbols = ['MyInterface', 'MyType'];

    // Assert that the exported symbols match the expected result
    expect(exportedSymbols).toEqual(expectedSymbols);
  });
});
