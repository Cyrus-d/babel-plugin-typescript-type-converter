import { readFileSync, writeFileSync, existsSync } from 'fs';
import { getModuleReferences } from './moduleDependencies';

/*
  hack: to trigger update
*/

export const updateReferences = (modulePath: string) => {
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
