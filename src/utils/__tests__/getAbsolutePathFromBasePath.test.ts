import path from 'path';
import { getAbsolutePathFromBasePath } from '../getAbsolutePathFromBasePath'; // Replace 'yourModuleName' with the actual module name

describe('getAbsolutePathFromBasePath', () => {
  it('should resolve relative path correctly', () => {
    const root = '/absolute/path/to/root';
    const sourceFilePath = '/absolute/path/to/source/file';
    const relativePathToBase = './relative/path/to/base';

    const expectedResult = '/absolute/path/to/source/relative/path/to/base';
    const resolvedPath = getAbsolutePathFromBasePath(root, sourceFilePath, relativePathToBase);

    expect(path.relative('', resolvedPath)).toBe(path.relative('', expectedResult));
  });

  it('should join root and relative path when relativePathToBase does not start with dot', () => {
    const root = '/absolute/path/to/root';
    const sourceFilePath = '/absolute/path/to/source/file';
    const relativePathToBase = 'some-package';

    const expectedResult = '/absolute/path/to/root/node_modules/some-package';
    const resolvedPath = getAbsolutePathFromBasePath(root, sourceFilePath, relativePathToBase);

    expect(path.relative('', resolvedPath)).toBe(path.relative('', expectedResult));
  });
});
