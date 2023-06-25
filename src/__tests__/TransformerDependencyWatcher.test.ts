/* eslint-disable no-new */
import fs from 'fs';
import chokidar from 'chokidar';
import { FileMap } from '../utils';
import { PluginOptionsInternal } from '../types';
import { TransformerDependencyWatcher } from '../TransformerDependencyWatcher';
import { TRANSFORM_TYPE_TO_SCHEMA } from '../constants';
import { setUpdateCacheFileContent } from '../utils/cache-fs';

// Mock the dependencies
jest.mock('fs');

// jest.mock('../utils');
jest.mock('../SourceFileCache');

jest.mock('../utils/cache-fs');

jest.mock('path', () => {
  const originalPath = jest.requireActual('path');

  return {
    ...originalPath,
    // normalize: (p: string) => p,
    dirname: (p: string) => '',
  };
});

jest.spyOn(fs, 'existsSync').mockReturnValue(true);

jest.mock('chokidar', () => {
  return {
    watch: jest.fn(() => ({
      on: jest.fn(),
      close: jest.fn(),
    })),
  };
});

const transformerFilePath = './transformerFilePath.tsx';
const dependencyFilePath = './dependencyFilePath.ts';

// const chokidar = require('chokidar');

// Import the module to be tested

describe('TransformerDependencyWatcher', () => {
  let mockOptions: PluginOptionsInternal;

  beforeEach(() => {
    mockOptions = {
      root: './',
      // Mock your options here
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize the properties correctly', () => {
    const watcherInstance = new TransformerDependencyWatcher(mockOptions);
    // Test the initialization of properties
    expect(watcherInstance.watchingFiles).toBeInstanceOf(FileMap);
    expect(watcherInstance.pluginOptions).toBe(mockOptions);
    expect(watcherInstance.dependenciesFilePaths).toBeInstanceOf(FileMap);
    expect(watcherInstance.transformerFilePaths).toBeInstanceOf(FileMap);
    // Add more property assertions as needed
  });

  test('should create a chokidar watcher', () => {
    // eslint-disable-next-line no-new
    new TransformerDependencyWatcher(mockOptions);

    // Test the creation of chokidar watcher
    expect(chokidar.watch).toHaveBeenCalledWith(
      ['**/*.ts', '**/*.tsx'],
      expect.objectContaining({
        awaitWriteFinish: expect.objectContaining({
          pollInterval: 100,
          stabilityThreshold: 1000,
        }),
        ignored: expect.any(Array),
        ignoreInitial: true,
        persistent: true,
      }),
    );
  });

  test('should update cache file timestamp', () => {
    const watcherInstance = new TransformerDependencyWatcher({
      ...mockOptions,
      cacheInvalidationStrategy: 'externalDependency',
    });

    jest.spyOn(fs, 'writeFileSync');

    watcherInstance.addDependency(transformerFilePath, dependencyFilePath);

    watcherInstance.onFileChange('change', dependencyFilePath);

    expect(setUpdateCacheFileContent).toHaveBeenCalled();
  });

  test('should add comment to transformer file when dependency changed', () => {
    const watcherInstance = new TransformerDependencyWatcher({
      ...mockOptions,
      cacheInvalidationStrategy: 'comment',
    });

    const spyOnWriteFileSync = jest.spyOn(fs, 'writeFileSync');

    jest.spyOn(fs, 'readFileSync').mockReturnValueOnce(`${TRANSFORM_TYPE_TO_SCHEMA}<`);

    watcherInstance.addDependency(transformerFilePath, dependencyFilePath);

    watcherInstance.onFileChange('change', dependencyFilePath);

    expect(
      spyOnWriteFileSync.mock.calls[0][1]
        .toString()
        .startsWith('// typescript-type-transformer:update'),
    ).toBeTruthy();
  });

  test('should not add comment or update cache file timestamp if cacheInvalidationStrategy not set', () => {
    const watcherInstance = new TransformerDependencyWatcher(mockOptions);

    jest.spyOn(fs, 'readFileSync').mockReturnValueOnce(TRANSFORM_TYPE_TO_SCHEMA);

    watcherInstance.addDependency(transformerFilePath, dependencyFilePath);

    watcherInstance.onFileChange('change', dependencyFilePath);

    expect(setUpdateCacheFileContent).not.toHaveBeenCalled();
  });

  test('should deleteTransformerAndDependencies', () => {
    const watcherInstance = new TransformerDependencyWatcher(mockOptions);

    watcherInstance.addDependency(transformerFilePath, dependencyFilePath);

    watcherInstance.deleteTransformerAndDependencies(transformerFilePath);

    expect(watcherInstance.dependenciesFilePaths.keys()).toStrictEqual(['dependencyFilePath.ts']);
    expect(watcherInstance.dependenciesFilePaths.get(dependencyFilePath)?.keys()).toStrictEqual([]);
    expect(watcherInstance.transformerFilePaths.keys()).toStrictEqual([]);
    expect(watcherInstance.transformerFilePaths.get(transformerFilePath)).toBeUndefined();
  });

  test('should deleteTransformerFilePathFormDependencies', () => {
    const watcherInstance = new TransformerDependencyWatcher(mockOptions);

    watcherInstance.addDependency(transformerFilePath, dependencyFilePath);

    expect(watcherInstance.dependenciesFilePaths.get(dependencyFilePath)?.keys()).toStrictEqual([
      'transformerFilePath.tsx',
    ]);

    watcherInstance.deleteTransformerFilePathFormDependencies(transformerFilePath);

    expect(watcherInstance.dependenciesFilePaths.keys()).toStrictEqual(['dependencyFilePath.ts']);
    expect(watcherInstance.dependenciesFilePaths.get(dependencyFilePath)?.keys()).toStrictEqual([]);
    expect(watcherInstance.transformerFilePaths.keys()).toStrictEqual(['transformerFilePath.tsx']);
    expect(watcherInstance.transformerFilePaths.get(transformerFilePath)?.keys()).toStrictEqual([
      'dependencyFilePath.ts',
    ]);
  });

  describe('onFileChange', () => {
    test('should trigger transformer file change on transformer dependency file change', () => {
      const watcherInstance = new TransformerDependencyWatcher(mockOptions);

      const spyOnUpdateTransformerFilesByDependencyPath = jest.spyOn(
        watcherInstance,
        'updateTransformerFilesByDependencyPath',
      );

      watcherInstance.addDependency(transformerFilePath, dependencyFilePath);

      watcherInstance.onFileChange('change', dependencyFilePath);

      expect(spyOnUpdateTransformerFilesByDependencyPath).toHaveBeenCalled();
    });

    test('should delete transformer dependencies', () => {
      const watcherInstance = new TransformerDependencyWatcher(mockOptions);

      const spyOnDeleteTransformerFilePathFormDependencies = jest.spyOn(
        watcherInstance,
        'deleteTransformerFilePathFormDependencies',
      );

      watcherInstance.addDependency(transformerFilePath, dependencyFilePath);

      watcherInstance.onFileChange('unlink', dependencyFilePath);

      expect(spyOnDeleteTransformerFilePathFormDependencies).toHaveBeenCalled();
    });
  });
});
