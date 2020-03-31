import { readFileSync, writeFileSync, existsSync } from 'fs';
import { getModuleReferences } from './moduleDependencies';
import {} from './sourceFile';

const initializedFile: { [key: string]: boolean } = {};

/*
  hack: to trigger update
*/

export const updateReferences = (modulePath: string) => {
  if (!initializedFile[modulePath]) {
    initializedFile[modulePath] = true;

    return;
  }
  const refs = getModuleReferences(modulePath);
  if (refs) {
    refs.forEach(ref => {
      if (existsSync(ref)) {
        const content = readFileSync(ref, 'utf8');
        writeFileSync(ref, content, { encoding: 'utf8', flag: 'w' });
      }
    });
  }
};
