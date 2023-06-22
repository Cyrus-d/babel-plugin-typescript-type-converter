/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */
/* eslint-disable no-loop-func */
/* eslint-disable no-plusplus */
import * as fs from 'fs';
import * as transformerFuncNames from '../constants/convert-functions';

export function setUpdateComment(filePath: string, timestamp: number) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  let lines = fileContent.split('\n');

  const stringsToMatch = Object.values(transformerFuncNames);

  lines = lines.filter((line) => !line.trim().startsWith('// typescript-type-transformer:update='));

  const result = [];

  for (const line of lines) {
    const isTransformerFunc = stringsToMatch.findIndex((str: string) => line.includes(str)) !== -1;

    if (isTransformerFunc) {
      result.push(`// typescript-type-transformer:update=${timestamp}`);
    }
    result.push(line);
  }

  const updatedContent = result.join('\n');
  fs.writeFileSync(filePath, updatedContent, 'utf8');
}
