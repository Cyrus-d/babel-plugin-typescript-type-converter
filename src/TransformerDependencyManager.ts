/* eslint-disable no-magic-numbers */
import { debounce } from 'lodash';
import { FileMap, getWatcher, setUpdateCacheFileContent, sourceFileCacheInstance } from './utils';

const createMapIfNotExist = (fileMap: FileMap, key: string) => {
  if (!fileMap.has(key)) {
    fileMap.set(key, new FileMap());
  }
};

type TransformerModuleDependencies = FileMap<string, boolean>;
type TransformerModuleRecords = FileMap<string, boolean>;

const onDependencyChange = debounce((root: string, filePath: string) => {
  sourceFileCacheInstance.updateSourceFileByPath(filePath);
  setUpdateCacheFileContent(root, { timestamp: Date.now() });
}, 1000);

class TransformerDependencyManager {
  dependenciesFilePaths = new FileMap<string, TransformerModuleRecords>();

  transformerFilePaths = new FileMap<string, TransformerModuleDependencies>();

  watchingFiles = new FileMap<string, boolean>();

  watchDependencyChange(projectRootPath: string, dependencyFilePath: string) {
    const watchr = getWatcher(dependencyFilePath);
    this.watchingFiles.set(dependencyFilePath, true);
    watchr.on('change', (depPath) => {
      onDependencyChange(projectRootPath, depPath);
    });
  }

  addDependency(projectRootPath: string, transformerFilePath: string, dependencyFilePath: string) {
    createMapIfNotExist(this.dependenciesFilePaths, dependencyFilePath);
    createMapIfNotExist(this.transformerFilePaths, transformerFilePath);

    const deps = this.dependenciesFilePaths.get(dependencyFilePath);
    deps?.set(transformerFilePath, true);

    const transformer = this.transformerFilePaths.get(transformerFilePath);
    transformer?.set(dependencyFilePath, true);

    if (!this.watchingFiles.has(dependencyFilePath)) {
      this.watchDependencyChange(projectRootPath, dependencyFilePath);
    }
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

const transformerDependencyManager = new TransformerDependencyManager();

export { transformerDependencyManager };
