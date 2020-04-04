import path from 'path';
import {
  updateSourceFileByPath,
  getAllSourceFiles,
  createSourceFile,
  getSourceFile,
} from '../src/utils/sourceFile';
import { getFileKey } from '../src/utils/getFileKey';

jest.mock('chokidar', () => ({
  watch: jest.fn(() => ({
    on: jest.fn(() => {}),
  })),
}));

describe('sourceFile', () => {
  const filePath = path.join(
    __dirname,
    './fixtures/manual-converter/type-schema/interface-schema.ts',
  );
  updateSourceFileByPath({ expose: 'none', jsDoc: 'none', topRef: true }, filePath);

  it('should initialize sourceFiles', () => {
    const allSourceFiles = getAllSourceFiles();
    expect(Object.keys(allSourceFiles).length > 0).toBe(true);
  });

  it('should not create source file if exist', () => {
    const src = getSourceFile(getFileKey(filePath), true);
    const srcCatch = createSourceFile(filePath);
    expect(srcCatch).toBe(src);
  });

  it('should update source file', () => {
    const src = getSourceFile(getFileKey(filePath), true);
    const srcCatch = createSourceFile(filePath, true);
    expect(srcCatch === src).toBeFalsy();
  });
});
