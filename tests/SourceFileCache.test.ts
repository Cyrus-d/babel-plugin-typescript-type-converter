import path from 'path';
import {} from '../src/utils';
import { SourceFileCache } from '../src/SourceFileCache';

jest.mock('chokidar', () => ({ watch: jest.fn(() => ({ on: jest.fn(() => {}) })) }));

describe('sourceFile', () => {
  const filePath = path.join(
    __dirname,
    './fixtures/manual-converter/type-schema/interface-schema.ts',
  );

  const { initialize, getAllSourceFiles, getSourceFile, createOrUpdateSourceFile } =
    new SourceFileCache();

  initialize({ root: __dirname });

  createOrUpdateSourceFile(filePath);

  it('should initialize sourceFiles', () => {
    const allSourceFiles = getAllSourceFiles();
    expect(Object.keys(allSourceFiles).length > 0).toBe(true);
  });

  it('should not create source file if exist', () => {
    const src = getSourceFile(filePath, true);
    const srcCatch = createOrUpdateSourceFile(filePath);
    expect(srcCatch === src).toBeTruthy();
  });

  it('should not update source file with same content', () => {
    const src = getSourceFile(filePath, true);
    const srcCatch = createOrUpdateSourceFile(filePath, true);
    expect(srcCatch === src).toBeTruthy();
  });

  it('should update source file', () => {
    const src = getSourceFile(filePath, true);
    const srcCatch = createOrUpdateSourceFile(filePath, true, true);
    expect(srcCatch === src).toBeFalsy();
  });
});

describe('sourceFile update', () => {
  const refFile = path.join(__dirname, './fixtures/manual-converter/typings/props.ts');

  const fileWithDependencies = path.join(
    __dirname,
    './fixtures/manual-converter/type-schema/extended-type-schema.ts',
  );

  const { initialize, getSourceFile, createOrUpdateSourceFile, updateSourceFileByPath } =
    new SourceFileCache();

  // initial load
  initialize({ root: __dirname });

  createOrUpdateSourceFile(fileWithDependencies, true);

  it('should update referenced files if not in node_modules folder', () => {
    const moduleSourceFile = getSourceFile(refFile, true);
    const refSourceFile = getSourceFile(refFile, true);

    updateSourceFileByPath(fileWithDependencies, true);

    const moduleSourceFileAfter = getSourceFile(refFile, true);
    const refSourceFileAfter = getSourceFile(refFile, true);

    expect(refSourceFile === refSourceFileAfter).toBeFalsy();
    expect(moduleSourceFile === moduleSourceFileAfter).toBeFalsy();
  });

  it('should update file itself', () => {
    const src = getSourceFile(refFile, true);
    updateSourceFileByPath(refFile, true);
    const src2 = getSourceFile(refFile, true);
    expect(src === src2).toBeFalsy();
  });
});
