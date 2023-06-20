import * as ts from 'typescript';
import { getAllTypeIntersections } from '../getAllTypeIntersections';

describe('getAllTypeIntersections', () => {
  it('should return the type names from type intersections in exampleOneFile.ts', () => {
    const sourceFile = ts.createSourceFile(
      'exampleOneFile.ts',
      `
      import {Bar} from './file1'
      import {Baz} from './file2'
      import {Baba} from './file3'

      export Baba;
      export type Foo = Baz & Bar;
      `,
      ts.ScriptTarget.Latest,
    );

    const typeNames = getAllTypeIntersections(sourceFile, 'Foo');
    expect(typeNames).toEqual(['Baz', 'Bar']);
  });

  it('should return the type names from type intersections in exampleTwoFile.ts', () => {
    const sourceFile = ts.createSourceFile(
      'exampleTwoFile.ts',
      `
      import {Bar} from './file1'
      import {Baz} from './file2'

      export interface Foo extends Bar, Baz {

      }
      `,
      ts.ScriptTarget.Latest,
    );

    const typeNames = getAllTypeIntersections(sourceFile, 'Foo');
    expect(typeNames).toEqual(['Bar', 'Baz']);
  });

  it('should return an empty array when no type intersections are found', () => {
    const sourceFile = ts.createSourceFile(
      'exampleThreeFile.ts',
      `
      import {Bar} from './file1'
      import {Baz} from './file2'

      export type Foo = Baz | Bar;
      `,
      ts.ScriptTarget.Latest,
    );

    const typeNames = getAllTypeIntersections(sourceFile, 'Foo');
    expect(typeNames).toEqual([]);
  });

  it('should return an empty array when the specified type name is not found', () => {
    const sourceFile = ts.createSourceFile(
      'exampleFourFile.ts',
      `
      import {Bar} from './file1'
      import {Baz} from './file2'

      export type Foo = Baz & Bar;
      `,
      ts.ScriptTarget.Latest,
    );

    const typeNames = getAllTypeIntersections(sourceFile, 'SomeType');
    expect(typeNames).toEqual([]);
  });
});
