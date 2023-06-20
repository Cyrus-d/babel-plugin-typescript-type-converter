import path from 'path';
import { resolveRelativePath } from './resolveRelativePath';

export const getAbsolutePathFromBasePath = (
  projectRootPath: string,
  baseFilePath: string,
  relativePathToBase: string,
) => {
  return relativePathToBase.startsWith('.')
    ? resolveRelativePath(baseFilePath, relativePathToBase)
    : path.join(projectRootPath, 'node_modules', relativePathToBase);
};
