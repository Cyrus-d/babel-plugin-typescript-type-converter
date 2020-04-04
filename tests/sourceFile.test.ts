import path from 'path';
import {
  updateSourceFileByPath,
  getAllSourceFiles,
  createOrUpdateSourceFile,
  getSourceFile,
} from '../src/utils/sourceFile';
import { getFileKey } from '../src/utils/getFileKey';
import { setModuleDependencies } from '../src/utils/moduleDependencies';

jest.mock('chokidar', () => ({ watch: jest.fn(() => ({ on: jest.fn(() => {}) })) }));

describe('sourceFile', () => {
  const filePath = path.join(
    __dirname,
    './fixtures/manual-converter/type-schema/interface-schema.ts',
  );
  updateSourceFileByPath(filePath, { expose: 'none', jsDoc: 'none', topRef: true });

  it('should initialize sourceFiles', () => {
    const allSourceFiles = getAllSourceFiles();
    expect(Object.keys(allSourceFiles).length > 0).toBe(true);
  });

  it('should not create source file if exist', () => {
    const src = getSourceFile(getFileKey(filePath), true);
    const srcCatch = createOrUpdateSourceFile(filePath);
    expect(srcCatch === src).toBeTruthy();
  });

  it('should not update source file with same content', () => {
    const src = getSourceFile(getFileKey(filePath), true);
    const srcCatch = createOrUpdateSourceFile(filePath, true);
    expect(srcCatch === src).toBeTruthy();
  });

  it('should update source file', () => {
    const src = getSourceFile(getFileKey(filePath), true);
    const srcCatch = createOrUpdateSourceFile(filePath, true, true);
    expect(srcCatch === src).toBeFalsy();
  });
});

describe('sourceFile dependance', () => {
  const refFile = path.join(__dirname, './fixtures/manual-converter/typings/props.ts');

  const fileWithDependencies = path.join(
    __dirname,
    './fixtures/manual-converter/type-schema/extended-type-schema.ts',
  );

  // initial load
  updateSourceFileByPath(refFile, { expose: 'none', jsDoc: 'none', topRef: true });
  createOrUpdateSourceFile(fileWithDependencies, true);

  // map ref to module
  setModuleDependencies(fileWithDependencies, [refFile]);

  it('should update referenced files if not in node_modules folder', () => {
    const src = getSourceFile(getFileKey(refFile), true);
    updateSourceFileByPath(fileWithDependencies, undefined, true);
    const src2 = getSourceFile(getFileKey(refFile), true);
    expect(src === src2).toBeFalsy();
  });

  it('should update file itself', () => {
    const src = getSourceFile(getFileKey(refFile), true);
    updateSourceFileByPath(refFile, undefined, true);
    const src2 = getSourceFile(getFileKey(refFile), true);
    expect(src === src2).toBeFalsy();
  });
});
