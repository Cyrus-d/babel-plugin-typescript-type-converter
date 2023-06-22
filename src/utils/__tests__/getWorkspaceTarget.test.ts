import fs from 'fs';
import { getWorkspaceTarget, processedFileMap } from '../getWorkspaceTarget';

// eslint-disable-next-line jest/prefer-spy-on

// jest.spyOn(global, 'Map').mockImplementation(
//   () =>
//     // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
//     ({
//       set: jest.fn().mockImplementation(() => {
//         console.log();
//       }),
//       get: jest.fn().mockReturnValue(undefined),
//       has: jest.fn().mockReturnValue(false),
//     } as any),
// );

describe('getWorkspaceTarget', () => {
  const pathWithNodeModules =
    'c:\\Projects\\node_modules\\@components\\text-field\\text-field-props.ts';

  const targetPath = 'c:\\Projects\\packages\\components\\TextField\\text-field-props.ts';

  beforeEach(() => {
    processedFileMap.clear();
  });

  it('should be defined', () => {
    expect(getWorkspaceTarget).toBeDefined();
  });

  it('should return workspace target', () => {
    const existsSyncMock = jest.spyOn(fs, 'existsSync').mockReturnValue(true);

    expect(getWorkspaceTarget(pathWithNodeModules, ['packages'])).toBe(targetPath);

    existsSyncMock.mockRestore();
  });

  it('should return package path if unable to find target folder', () => {
    const existsSyncMock = jest.spyOn(fs, 'existsSync').mockImplementation((p) => {
      if (p === targetPath) return false;

      return true;
    });

    expect(getWorkspaceTarget(pathWithNodeModules, ['packages'])).toBe(
      'c:\\Projects\\packages\\components\\text-field\\text-field-props.ts',
    );

    existsSyncMock.mockRestore();
  });

  it('should return original path if none of other exist', () => {
    const existsSyncMock = jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    expect(getWorkspaceTarget(pathWithNodeModules, ['packages'])).toBe(pathWithNodeModules);

    existsSyncMock.mockRestore();
  });
});
