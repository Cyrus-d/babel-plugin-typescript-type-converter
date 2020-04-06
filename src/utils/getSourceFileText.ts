import * as fs from 'fs';

export const getSourceFileText = (fileName: string) => {
  if (!fs.existsSync(fileName)) return null;

  return fs.readFileSync(fileName, 'utf8');
};
