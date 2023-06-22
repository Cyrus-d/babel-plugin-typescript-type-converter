import path from 'path';
import { normalizeFilePath } from './normalizeFilePath';

export interface Dependencies {
  [k: string]: Dependencies;
}

const moduleDependencies = new Map<string, Set<string>>();
const moduleReferences = new Map<string, Set<string>>();

const cleanModuleDependencies = (moduleKey: string) => {
  const oldDeps = moduleDependencies.get(moduleKey);
  if (!oldDeps) return;
  oldDeps.forEach((importKey) => {
    const importModule = moduleReferences.get(importKey);

    if (importModule) {
      importModule.delete(moduleKey);

      if (importModule.size === 0) {
        moduleReferences.delete(importKey);
      }
    }
  });

  moduleDependencies.delete(moduleKey);
};

export const cleanModuleDependenciesByPath = (filePath: string) => {
  const fileKey = normalizeFilePath(filePath);
  cleanModuleDependencies(fileKey);
};

export const setModuleReferences = (modulePath: string, refModule: string) => {
  const fileKey = normalizeFilePath(modulePath);

  const module = moduleReferences.get(fileKey);

  if (module) {
    module.add(refModule);
  } else {
    moduleReferences.set(fileKey, new Set<string>().add(refModule));
  }
};

export const setModuleDependencies = (modulePath: string, dependencies: string[]) => {
  const fileKey = normalizeFilePath(modulePath);

  cleanModuleDependencies(fileKey);

  if (dependencies.length === 0) {
    return;
  }

  const dependencySet = new Set<string>();

  new Set(dependencies).forEach((dep) => {
    const importKey = normalizeFilePath(dep);
    if (fileKey !== importKey) {
      dependencySet.add(path.normalize(dep));

      setModuleReferences(importKey, modulePath);
    }
  });

  moduleDependencies.set(fileKey, dependencySet);
};

export const getModuleDependencies = (modulePath: string) => {
  const key = normalizeFilePath(modulePath);

  return moduleDependencies.get(key);
};

export const getModuleReferences = (fileName: string) => {
  const fileKey = normalizeFilePath(fileName);
  const modules = moduleReferences.get(fileKey);

  return modules;
};

export const getAllModuleReferences = () => {
  return moduleReferences;
};

export const deleteModuleReference = (fileName: string) => {
  const fileKey = normalizeFilePath(fileName);
  moduleReferences.delete(fileKey);
};
