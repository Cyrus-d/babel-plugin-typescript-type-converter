/* eslint-disable no-restricted-syntax */
import path from 'path';
import fs from 'fs';
import { pascalCase } from 'change-case';

export const processedFileMap = new Map<string, string>();

export const getWorkspaceTarget = (filePath: string, workspaceDirNames?: string[]) => {
  const pathNormalized = path.normalize(filePath);

  const processedFile = processedFileMap.get(filePath);

  if (processedFile) return processedFile;

  const nodeModulesPath = pathNormalized.split('node_modules');

  if (nodeModulesPath.length === 1 || !workspaceDirNames || workspaceDirNames.length === 0) {
    return filePath;
  }

  const basePath = nodeModulesPath[0];
  let restOfThePath = nodeModulesPath[1];

  const atIndex = restOfThePath.indexOf('@');

  if (atIndex === -1) {
    return filePath;
  }
  // eslint-disable-next-line no-negated-condition
  restOfThePath = atIndex !== -1 ? restOfThePath.slice(atIndex + 1) : restOfThePath;

  const restOfThePathPascalCase = restOfThePath.split(path.sep).map((s, i) => {
    if (i === 1) return pascalCase(s);

    return s;
  });

  for (const workspaceDirName of workspaceDirNames) {
    let workspacePath = path.join(basePath, workspaceDirName, ...restOfThePathPascalCase);

    if (fs.existsSync(workspacePath)) {
      processedFileMap.set(filePath, workspacePath);

      return workspacePath;
    }

    workspacePath = path.join(basePath, workspaceDirName, restOfThePath);

    if (fs.existsSync(workspacePath)) {
      processedFileMap.set(filePath, workspacePath);

      return workspacePath;
    }
  }
  processedFileMap.set(filePath, filePath);

  return filePath;
};
