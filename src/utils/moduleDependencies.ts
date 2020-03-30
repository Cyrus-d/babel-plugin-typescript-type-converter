/* eslint-disable @typescript-eslint/require-await */
import { fixPath } from './fixPath';

export interface Dependencies {
  [k: string]: Dependencies;
}

const moduleDependencies = new Map<string, Set<string>>();
const importedModules = new Map<string, Set<string>>();

const cleanModuleDependencies = (modulePath: string) => {
  const oldDeps = moduleDependencies.get(modulePath);
  if (!oldDeps) return;
  oldDeps.forEach(importPath => {
    const importModule = importedModules.get(importPath);

    if (importModule) {
      importModule.delete(modulePath);

      if (importModule.size === 0) {
        importedModules.delete(importPath);
      }
    }
  });

  moduleDependencies.delete(modulePath);
};

export const setImportedModuleParent = (importedModulePath: string, parentModule: string) => {
  const importPath = fixPath(importedModulePath);

  const importedModule = importedModules.get(importPath);

  if (importedModule) {
    importedModule.add(importPath);
  } else {
    importedModules.set(importPath, new Set<string>().add(parentModule));
  }
};

export const setModuleDependencies = async (modulePath: string, dependencies: string[]) => {
  modulePath = fixPath(modulePath);
  if (dependencies.length === 0) return;

  const dependencySet = new Set<string>();

  cleanModuleDependencies(modulePath);

  new Set(dependencies).forEach(dep => {
    const importPath = fixPath(dep);
    if (modulePath !== importPath) {
      dependencySet.add(importPath);

      setImportedModuleParent(importPath, modulePath);
    }
  });

  moduleDependencies.set(modulePath, dependencySet);
};

export const getModuleReferences = (modulePath: string) => {
  modulePath = fixPath(modulePath);

  return importedModules.get(modulePath);
};
