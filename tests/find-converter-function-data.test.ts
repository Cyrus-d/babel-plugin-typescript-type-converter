import * as ts from 'typescript';
import { findConverterFunctionData } from '../src/utils/find-converter-function-data';

describe('findConverterFunctionData', () => {
  test('should find function info with single type argument', () => {
    const code = `
      import { MyType } from "./type";

      function transform<T>() {
        // Function implementation
      }

      const result = transform<MyType>();
    `;

    const sourceFile = ts.createSourceFile('file.ts', code, ts.ScriptTarget.Latest);
    const functionInfos = findConverterFunctionData(sourceFile, ['transform']);

    expect(functionInfos).toEqual([
      {
        functionName: 'transform',
        types: [{ name: 'MyType', path: './type' }],
      },
    ]);
  });

  test('should find function info with multiple type arguments', () => {
    const code = `
      import { MyType } from "./type";
      import { MyType2 } from "./type2";

      function transform<T>() {
        // Function implementation
      }

      const result = transform<MyType & MyType2>();
    `;

    const sourceFile = ts.createSourceFile('file.ts', code, ts.ScriptTarget.Latest);
    const functionInfos = findConverterFunctionData(sourceFile, ['transform']);

    expect(functionInfos).toEqual([
      {
        functionName: 'transform',
        types: [
          { name: 'MyType', path: './type' },
          { name: 'MyType2', path: './type2' },
        ],
      },
    ]);
  });

  test('should find function info with multiple type arguments and ignore inline type', () => {
    const code = `
      import { MyType } from "./type";
      import { MyType2 } from "./type2";

      function transform<T>() {
        // Function implementation
      }

      const result = transform<MyType & MyType2 & {foo:string}>();
    `;

    const sourceFile = ts.createSourceFile('file.ts', code, ts.ScriptTarget.Latest);
    const functionInfos = findConverterFunctionData(sourceFile, ['transform']);

    expect(functionInfos).toEqual([
      {
        functionName: 'transform',
        types: [
          { name: 'MyType', path: './type' },
          { name: 'MyType2', path: './type2' },
        ],
      },
    ]);
  });

  test('should find function info with multiple type arguments and not have path for internal types', () => {
    const code = `
      import { MyType } from "./type";

      type LocalType1={foo:string};
      export type LocalType2={bar:string};


      function transform<T>() {
        // Function implementation
      }

      const result = transform<MyType & LocalType1 & LocalType2>();
    `;

    const sourceFile = ts.createSourceFile('file.ts', code, ts.ScriptTarget.Latest);
    const functionInfos = findConverterFunctionData(sourceFile, ['transform']);

    expect(functionInfos).toEqual([
      {
        functionName: 'transform',
        types: [
          { name: 'MyType', path: './type' },
          { name: 'LocalType1', path: undefined },
          { name: 'LocalType2', path: undefined },
        ],
      },
    ]);
  });

  test('should not throw error if unable to find type path', () => {
    const code = `

      function transform<T>() {
        // Function implementation
      }

      const result = transform<MyType>();
    `;

    const sourceFile = ts.createSourceFile('file.ts', code, ts.ScriptTarget.Latest);
    const functionInfos = findConverterFunctionData(sourceFile, ['transform']);

    expect(functionInfos).toEqual([
      { functionName: 'transform', types: [{ name: 'MyType', path: undefined }] },
    ]);
  });

  // Add more test cases as needed
});
