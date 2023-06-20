import ts from 'typescript';
import { getAllConnectedSourceFilesByType } from '../getAllConnectedSourceFilesByType';

// Mock source files for testing
const createSourceFileMock = (fileName: string, code: string): ts.SourceFile => {
  const sourceFile = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest);
  // Add other necessary properties/methods of SourceFile
  // eslint-disable-next-line newline-before-return
  return sourceFile;
};

// Mocked source files for testing
const sourceFiles: readonly ts.SourceFile[] = [
  createSourceFileMock(
    'app.ts',
    `
    import {A} from './file1'
    import {B} from './file2'
    import {C} from './file3'

    export type Foo = A & B;
    export type Bar = C;
    `,
  ),
  createSourceFileMock(
    'file1.ts',
    `

    export type A={};
  `,
  ),
  createSourceFileMock(
    'file2.ts',
    `
    export type B={};
  `,
  ),
  createSourceFileMock(
    'file3.ts',
    `
    import {D} from './file4'
     export type C={} & D;
  `,
  ),
  createSourceFileMock(
    'file4.ts',
    `
     export type D={};
  `,
  ),
];

describe('getAllConnectedSourceFilesByType', () => {
  it('should return an empty array if no connected files found', () => {
    const file = sourceFiles.find((sf) => sf.fileName === 'app.ts');
    expect(file).toBeDefined();
    const connectedFiles = getAllConnectedSourceFilesByType('', sourceFiles, file!, 'UnknownType');
    expect(connectedFiles).toEqual([]);
  });

  it('should return connected files for a given type', () => {
    const file = sourceFiles.find((sf) => sf.fileName === 'app.ts');

    const connectedFiles = getAllConnectedSourceFilesByType('', sourceFiles, file!, 'Foo');

    expect(connectedFiles.map((file) => file.fileName)).toEqual(['file1.ts', 'file2.ts']);
  });

  it('should return nested intersection connected files for a given type', () => {
    const file = sourceFiles.find((sf) => sf.fileName === 'app.ts');

    const connectedFiles = getAllConnectedSourceFilesByType('', sourceFiles, file!, 'Bar');

    // expect(connectedFiles).toBe();
    expect(connectedFiles.map((file) => file.fileName)).toEqual(['file3.ts', 'file4.ts']);
  });
  // test('should not return duplicate connected files', () => {
  //   const file = sourceFiles.find((sf) => sf.fileName === 'file3.ts');
  //   expect(file).toBeDefined();
  //   const connectedFiles = getAllConnectedSourceFilesByType(sourceFiles, file!, 'Foo');
  //   expect(connectedFiles.map((file) => file.fileName)).toEqual([
  //     'file1.ts',
  //     'file2.ts',
  //     'file3.ts',
  //     'file4.ts',
  //   ]);
  // });
  // test('should handle circular dependencies', () => {
  //   const file = sourceFiles.find((sf) => sf.fileName === 'file2.ts');
  //   expect(file).toBeDefined();
  //   const connectedFiles = getAllConnectedSourceFilesByType(sourceFiles, file!, 'Foo');
  //   expect(connectedFiles.map((file) => file.fileName)).toEqual([
  //     'file1.ts',
  //     'file2.ts',
  //     'file3.ts',
  //     'file4.ts',
  //   ]);
  // });
  // test('should handle multiple types with the same name', () => {
  //   const file = sourceFiles.find((sf) => sf.fileName === 'file4.ts');
  //   expect(file).toBeDefined();
  //   const connectedFiles = getAllConnectedSourceFilesByType(sourceFiles, file!, 'Bar');
  //   expect(connectedFiles.map((file) => file.fileName)).toEqual(['file3.ts', 'file4.ts']);
  // });
});
