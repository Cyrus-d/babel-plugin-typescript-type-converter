import glob from 'fast-glob';
import path from 'path';

export const getRootFiles = (root: string, ignore: string[] = []) => {
  const files = glob
    .sync('**/*.{ts,tsx}', { cwd: root, ignore: ['node_modules/**', ...ignore] })
    .map((x) => path.join(root, x));

  return files;
};
