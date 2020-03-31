/* eslint-disable @typescript-eslint/require-await */
import { fixPath } from './fixPath';

export interface Dependencies {
  [k: string]: Dependencies;
}

const moduleDependencies = new Map<string, Set<string>>();
const moduleReferences = new Map<string, Set<string>>();

const cleanModuleDependencies = (modulePath: string) => {
  const oldDeps = moduleDependencies.get(modulePath);
  if (!oldDeps) return;
  oldDeps.forEach(importPath => {
    const importModule = moduleReferences.get(importPath);

    if (importModule) {
      importModule.delete(modulePath);

      if (importModule.size === 0) {
        moduleReferences.delete(importPath);
      }
    }
  });

  moduleDependencies.delete(modulePath);
};

export const setModuleReferences = (modulePath: string, refModule: string) => {
  modulePath = fixPath(modulePath);

  const module = moduleReferences.get(modulePath);

  if (module) {
    module.add(refModule);
  } else {
    moduleReferences.set(modulePath, new Set<string>().add(refModule));
  }
};

export const setModuleDependencies = async (modulePath: string, dependencies: string[]) => {
  modulePath = fixPath(modulePath);

  cleanModuleDependencies(modulePath);

  if (dependencies.length === 0) {
    return;
  }

  const dependencySet = new Set<string>();

  new Set(dependencies).forEach(dep => {
    const importPath = fixPath(dep);
    if (modulePath !== importPath) {
      dependencySet.add(importPath);

      setModuleReferences(importPath, modulePath);
    }
  });

  moduleDependencies.set(modulePath, dependencySet);
};

export const getModuleDependencies = (modulePath: string) => {
  return moduleDependencies.get(modulePath);
};

export const getModuleReferences = (modulePath: string) => {
  modulePath = fixPath(modulePath);
  const modules = moduleReferences.get(modulePath);

  return modules;
};

export const getAllModuleReferences = () => {
  return moduleReferences;
};
