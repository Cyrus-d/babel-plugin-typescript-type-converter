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

    jest.spyOn(fs, 'readFileSync').mockReturnValueOnce(TRANSFORM_TYPE_TO_SCHEMA);

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
    // test('should handle "change" state correctly', () => {
    //   const mockFilePath = 'testFilePath';
    //   const mockTransformerFiles = new FileMap();
    //   const mockTransformerFilePaths = new FileMap();
    //   // Mock the required methods and properties
    //   watcherInstance.dependenciesFilePaths.get = jest.fn(() => mockTransformerFiles);
    //   sourceFileCache.updateSourceFileByPath = jest.fn();
    //   mockTransformerFiles.keys = jest.fn(() => ['transformerFilePath1', 'transformerFilePath2']);
    //   normalizeFilePath.mockReturnValueOnce('normalizedFilePath');
    //   fs.existsSync.mockReturnValueOnce(true);
    //   watcherInstance.pluginOptions.showDebugMessages = true;
    //   fs.readFileSync.mockReturnValueOnce('content');
    //   // Call the method with the "change" state
    //   watcherInstance.onFileChange('change', mockFilePath);
    //   // Assertions
    //   expect(sourceFileCache.updateSourceFileByPath).toHaveBeenCalledWith(mockFilePath);
    //   expect(chokidar.watch).toHaveBeenCalledWith(
    //     ['**/*.ts', '**/*.tsx'],
    //     expect.objectContaining({
    //       awaitWriteFinish: expect.objectContaining({
    //         pollInterval: 100,
    //         stabilityThreshold: 1000,
    //       }),
    //       ignored: expect.any(Array),
    //       ignoreInitial: true,
    //       persistent: true,
    //     })
    //   );
    //   expect(watcherInstance.pluginOptions.showDebugMessages).toBe(true);
    //   expect(console.log).toHaveBeenCalledWith(`type change detected > ${path.basename(mockFilePath)}`);
    //   expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
    //   expect(setUpdateComment).toHaveBeenCalledWith('transformerFilePath1', expect.any(Number));
    //   expect(setUpdateComment).toHaveBeenCalledWith('transformerFilePath2', expect.any(Number));
    //   expect(setUpdateCacheFileContent).toHaveBeenCalledWith(mockOptions.root, { timestamp: expect.any(Number) });
    // });
    //   test('should handle "unlink" and "unlinkDir" states correctly', () => {
    //     const mockFilePath = 'testFilePath';
    //     const mockTransformerDependencies = new FileMap();
    //     // Mock the required methods and properties
    //     watcherInstance.transformerFilePaths.get = jest.fn(() => mockTransformerDependencies);
    //     mockTransformerDependencies.keys = jest.fn(() => ['dependencyFilePath1', 'dependencyFilePath2']);
    //     // Call the method with the "unlink" state
    //     watcherInstance.onFileChange('unlink', mockFilePath);
    //     // Assertions
    //     expect(mockTransformerDependencies.keys).toHaveBeenCalled();
    //     expect(mockTransformerDependencies.delete).toHaveBeenCalledWith('dependencyFilePath1');
    //     expect(mockTransformerDependencies.delete).toHaveBeenCalledWith('dependencyFilePath2');
    //     // Call the method with the "unlinkDir" state
    //     watcherInstance.onFileChange('unlinkDir', mockFilePath);
    //     // Assertions
    //     expect(mockTransformerDependencies.delete).toHaveBeenCalledWith(mockFilePath);
    //   });
    //   // Add more test cases for other states as needed
    // });
    // describe('deleteTransformerFilePathFormDependencies', () => {
    //   test('should delete transformer file path from dependencies', () => {
    //     const mockTransformerFilePath = 'testTransformerFilePath';
    //     const mockTransformerDependencies = new FileMap();
    //     const mockDependencyPaths = new FileMap();
    //     // Mock the required methods and properties
    //     watcherInstance.transformerFilePaths.get = jest.fn(() => mockTransformerDependencies);
    //     mockTransformerDependencies.keys = jest.fn(() => ['depFilePath1', 'depFilePath2']);
    //     watcherInstance.dependenciesFilePaths.get = jest.fn(() => mockDependencyPaths);
    //     // Call the method
    //     watcherInstance.deleteTransformerFilePathFormDependencies(mockTransformerFilePath);
    //     // Assertions
    //     expect(mockTransformerDependencies.keys).toHaveBeenCalled();
    //     expect(mockDependencyPaths.delete).toHaveBeenCalledWith('testTransformerFilePath');
    //     expect(mockDependencyPaths.delete).toHaveBeenCalledWith('depFilePath1');
    //     expect(mockDependencyPaths.delete).toHaveBeenCalledWith('depFilePath2');
    //   });
    // });
    // Add more test cases for other methods as needed
  });

  // describe('instantiateTransformerDependencyWatcher', () => {
  //   test('should instantiate the TransformerDependencyWatcher', () => {
  //     const mockOptions: PluginOptionsInternal = {
  //       // Mock your options here
  //     };

  //     instantiateTransformerDependencyWatcher(mockOptions);

  //     expect(getTransformerDependencyWatcher()).toBeInstanceOf(TransformerDependencyWatcher);
  //   });
  // });

  // describe('getTransformerDependencyWatcher', () => {
  //   test('should return the TransformerDependencyWatcher instance', () => {
  //     const watcherInstance = new TransformerDependencyWatcher({} as PluginOptionsInternal);
  //     watcherInstance.watchingFiles = new FileMap();

  //     expect(getTransformerDependencyWatcher()).toBe(watcherInstance);
  //   });
});
