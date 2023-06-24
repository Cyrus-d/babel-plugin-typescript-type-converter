/* eslint-disable no-console */
/* eslint-disable require-unicode-regexp */
import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { FileMap, normalizeFilePath, setUpdateCacheFileContent, setUpdateComment } from './utils';
import { sourceFileCache } from './SourceFileCache';
import { PluginOptionsInternal } from './types';

type TransformerModuleDependencies = FileMap<string, boolean>;
type TransformerModuleRecords = FileMap<string, boolean>;
type DependenciesFilePaths = FileMap<string, TransformerModuleRecords>;
type TransformerFilePaths = FileMap<string, TransformerModuleDependencies>;

class TransformerDependencyWatcher {
  watchingFiles: FileMap<string, boolean>;

  pluginOptions: PluginOptionsInternal;

  dependenciesFilePaths: DependenciesFilePaths;

  transformerFilePaths: TransformerFilePaths;

  constructor(options: PluginOptionsInternal) {
    this.pluginOptions = options;
    this.dependenciesFilePaths = new FileMap(options);
    this.transformerFilePaths = new FileMap(options);
    this.watchingFiles = new FileMap<string, boolean>(options);

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

    watcher.on('all', this.onFileChange.bind(this));
  }

  get PluginOptions() {
    return this.pluginOptions;
  }

  set PluginOptions(options: PluginOptionsInternal) {
    this.pluginOptions = options;
  }

  onFileChange(state: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir', _path: string) {
    const { root } = this.pluginOptions;

    const filePath = path.join(root, _path);

    switch (state) {
      case 'change':
        this.updateTransformerFilesByDependencyPath(filePath);
        break;
      case 'unlink':
      case 'unlinkDir':
        this.deleteTransformerFilePathFormDependencies(filePath);

        break;
      default:
        break;
    }
  }

  createMapIfNotExist = (fileMap: FileMap, key: string) => {
    if (!fileMap.has(key)) {
      fileMap.set(key, new FileMap(this.pluginOptions));
    }
  };

  addDependency(transformerFilePath: string, dependencyFilePath: string) {
    this.createMapIfNotExist(this.dependenciesFilePaths, dependencyFilePath);
    this.createMapIfNotExist(this.transformerFilePaths, transformerFilePath);

    const deps = this.dependenciesFilePaths.get(dependencyFilePath);
    deps?.set(transformerFilePath, true);

    const transformer = this.transformerFilePaths.get(transformerFilePath);
    transformer?.set(dependencyFilePath, true);
  }

  updateTransformerFilesByDependencyPath(depPath: string) {
    const transformerFiles = this.dependenciesFilePaths.get(depPath);
    const { showDebugMessages, root, cacheInvalidationStrategy } = this.PluginOptions;

    if (transformerFiles) {
      sourceFileCache.updateSourceFileByPath(depPath);
      const transformerFilePaths = transformerFiles
        .keys()
        .filter((x) => normalizeFilePath(depPath) !== normalizeFilePath(x));

      if (transformerFilePaths.length > 0) {
        if (showDebugMessages) {
          console.log(`type change detected > ${path.basename(depPath)}`);
        }

        transformerFilePaths.forEach((transformerFilePath) => {
          if (fs.existsSync(transformerFilePath)) {
            if (cacheInvalidationStrategy === 'comment') {
              setUpdateComment(transformerFilePath, Date.now());
            } else {
              const content = fs.readFileSync(transformerFilePath, 'utf8');
              fs.writeFileSync(transformerFilePath, content, {
                encoding: 'utf8',
                flag: 'w',
              });
              if (cacheInvalidationStrategy === 'externalDependency') {
                setUpdateCacheFileContent(root, { timestamp: Date.now() });
              }
            }
          }
        });
      }
    }
  }

  deleteTransformerFilePathFormDependencies(transformerFilePath: string) {
    const transformerDependencies = this.transformerFilePaths.get(transformerFilePath);
    if (transformerDependencies) {
      transformerDependencies.keys().forEach((depFilePath) => {
        const depsTransformerFilePaths = this.dependenciesFilePaths.get(depFilePath);
        if (depsTransformerFilePaths) {
          depsTransformerFilePaths.delete(transformerFilePath);
        }
      });
    }
  }

  deleteTransformerAndDependencies(transformerFilePath: string) {
    const transformerDependencies = this.transformerFilePaths.get(transformerFilePath);

    if (transformerDependencies) {
      transformerDependencies.keys().forEach((dependencyFilePath) => {
        const dependency = this.dependenciesFilePaths.get(dependencyFilePath);
        if (dependency) {
          dependency.delete(transformerFilePath);
        }
      });
    }
    this.transformerFilePaths.delete(transformerFilePath);
  }

  // deleteDependencyFilesPathFromTransformers(
  //   dependencyFilePath: string,
  //   transformersFilePaths: string[],
  // ) {
  //   const transformersPaths = this.dependenciesFilePaths.get(dependencyFilePath);
  //   if (transformersPaths) {
  //     transformersFilePaths.forEach((transformFilePath) => {
  //       transformersPaths.delete(transformFilePath);
  //     });
  //   }
  // }
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

export { TransformerDependencyWatcher };
