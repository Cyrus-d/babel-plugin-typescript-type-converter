/* eslint-disable no-console */
/* eslint-disable require-unicode-regexp */
import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { FileMap, normalizeFilePath, setUpdateCacheFileContent, setUpdateComment } from './utils';
import { sourceFileCache } from './SourceFileCache';
import { PluginOptions, PluginOptionsInternal } from './types';

type TransformerModuleDependencies = FileMap<string, boolean>;
type TransformerModuleRecords = FileMap<string, boolean>;
type DependenciesFilePaths = FileMap<string, TransformerModuleRecords>;
type TransformerFilePaths = FileMap<string, TransformerModuleDependencies>;

class TransformerDependencyWatcher {
  watchingFiles: FileMap<string, boolean>;

  pluginOptions: PluginOptions;

  dependenciesFilePaths: DependenciesFilePaths;

  transformerFilePaths: TransformerFilePaths;

  constructor(options: PluginOptionsInternal) {
    this.pluginOptions = options;
    this.dependenciesFilePaths = new FileMap(options);
    this.transformerFilePaths = new FileMap(options);
    this.watchingFiles = new FileMap<string, boolean>(options);

    const { root } = options;

    const watcher = chokidar.watch(['**/*.ts', '**/*.tsx'], {
      awaitWriteFinish: {
        pollInterval: 100,
        stabilityThreshold: 1000,
      },
      // cwd: path.resolve(root),
      ignored: [
        /(^|[\\/\\])\../, // Ignore dotfiles
        /node_modules([\\/\\][^\\/\\]+)*$/, // Ignore npm packages
      ],
      // ignored: /node_modules/,
      ignoreInitial: true,
      persistent: true,
    });

    const onFileChange = (
      state: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir',
      _path: string,
    ) => {
      const filePath = path.join(root, _path);
      switch (state) {
        case 'change':
          {
            const transformerFiles = this.dependenciesFilePaths.get(filePath);

            if (transformerFiles) {
              sourceFileCache.updateSourceFileByPath(filePath);
              const transformerFilePaths = transformerFiles
                .keys()
                .filter((x) => normalizeFilePath(filePath) !== normalizeFilePath(x));
              if (transformerFilePaths.length > 0) {
                if (options.showDebugMessages) {
                  console.log(`type change detected > ${path.basename(filePath)}`);
                }
                transformerFilePaths.forEach((transformerFilePath) => {
                  if (fs.existsSync(transformerFilePath)) {
                    if (options.cacheInvalidationStrategy === 'comment') {
                      setUpdateComment(transformerFilePath, Date.now());
                    } else {
                      const content = fs.readFileSync(transformerFilePath, 'utf8');
                      fs.writeFileSync(transformerFilePath, content, {
                        encoding: 'utf8',
                        flag: 'w',
                      });
                      setUpdateCacheFileContent(root, { timestamp: Date.now() });
                    }
                  }
                });
              }
            }
          }
          break;
        case 'unlink':
        case 'unlinkDir':
          {
            const transformerDependencies = this.transformerFilePaths.get(filePath);

            if (transformerDependencies) {
              transformerDependencies.keys().forEach((dependencyFilePath) => {
                const dependency = this.dependenciesFilePaths.get(dependencyFilePath);
                if (dependency) {
                  dependency.delete(filePath);
                }
              });
            }
            this.transformerFilePaths.delete(filePath);
          }
          break;
        default:
          break;
      }
    };

    watcher.on('all', onFileChange);
  }

  get PluginOptions() {
    return this.pluginOptions;
  }

  set PluginOptions(options: PluginOptions) {
    this.pluginOptions = options;
  }

  createMapIfNotExist = (fileMap: FileMap, key: string) => {
    if (!fileMap.has(key)) {
      fileMap.set(key, new FileMap(this.pluginOptions));
    }
  };

  addDependency(projectRootPath: string, transformerFilePath: string, dependencyFilePath: string) {
    this.createMapIfNotExist(this.dependenciesFilePaths, dependencyFilePath);
    this.createMapIfNotExist(this.transformerFilePaths, transformerFilePath);

    const deps = this.dependenciesFilePaths.get(dependencyFilePath);
    deps?.set(transformerFilePath, true);

    const transformer = this.transformerFilePaths.get(transformerFilePath);
    transformer?.set(dependencyFilePath, true);
  }

  addDependencies(
    projectRootPath: string,
    transformerFilePath: string,
    dependencyFilePaths: string[],
  ) {
    dependencyFilePaths.forEach((dependency) => {
      this.addDependency(projectRootPath, transformerFilePath, dependency);
    });
  }

  getTransformerDependencies(transformerFilePath: string) {
    return this.transformerFilePaths.get(transformerFilePath);
  }

  getDependencyTransformers(dependencyFilePath: string) {
    return this.dependenciesFilePaths.get(dependencyFilePath);
  }
}

let transformerDependencyWatcher: TransformerDependencyWatcher;

export const instantiateTransformerDependencyWatcher = (options: PluginOptionsInternal) => {
  if (!transformerDependencyWatcher)
    transformerDependencyWatcher = new TransformerDependencyWatcher(options);

  transformerDependencyWatcher.PluginOptions = options;
};

export const getTransformerDependencyWatcher = () => {
  return transformerDependencyWatcher!;
};
