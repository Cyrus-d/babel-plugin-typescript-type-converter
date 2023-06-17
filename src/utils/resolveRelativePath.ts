import path from 'path';

export function resolveRelativePath(filePath: string, relativePath: string) {
  if (!path.isAbsolute(relativePath)) {
    // If the relativePath is not absolute, make it relative to the filePath
    relativePath = path.join(path.dirname(filePath), relativePath);
  }

  return path.resolve(relativePath);
}
