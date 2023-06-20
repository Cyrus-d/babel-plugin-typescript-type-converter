import path from 'path';
import fs from 'fs';
import { UPDATE_CACHE_FILE_NAME } from '../constants';

interface UpdateCache {
  timestamp?: number;
}

export const getCacheFolderPath = (projectRootPath: string) => {
  return path.join(projectRootPath, '.cache', 'typescript-type-transformer');
};

export const getCacheFilePath = (projectRootPath: string, fileName: string) => {
  return path.join(getCacheFolderPath(projectRootPath), fileName);
};

export const setCacheFileContent = (projectRootPath: string, fileName: string, content: string) => {
  const cacheFolder = getCacheFolderPath(projectRootPath);

  if (!fs.existsSync(cacheFolder)) {
    fs.mkdirSync(cacheFolder, { recursive: true });
  }

  const cacheFilePath = getCacheFilePath(projectRootPath, fileName);

  fs.writeFileSync(cacheFilePath, content);

  return cacheFilePath;
};

export const geCacheFileContent = (projectRootPath: string, fileName: string) => {
  const cacheFilePath = getCacheFilePath(projectRootPath, fileName);

  const fileContents = fs.readFileSync(cacheFilePath, 'utf8');

  return fileContents;
};

export const getUpdateCacheFileContent = (projectRootPath: string) => {
  const fileContents = geCacheFileContent(projectRootPath, UPDATE_CACHE_FILE_NAME);

  return fileContents;
};

export const getUpdateCacheFileData = (projectRootPath: string): UpdateCache => {
  const fileContents = getUpdateCacheFileContent(projectRootPath);

  return fileContents ? JSON.parse(fileContents) : {};
};

export const setUpdateCacheFileContent = (projectRootPath: string, data: UpdateCache) => {
  const cacheFilePath = setCacheFileContent(
    projectRootPath,
    UPDATE_CACHE_FILE_NAME,
    JSON.stringify(data, null, 2),
  );

  return cacheFilePath;
};
