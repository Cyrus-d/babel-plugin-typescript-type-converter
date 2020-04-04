import { readFileSync, writeFileSync, existsSync } from 'fs';
import { getModuleReferences } from './moduleDependencies';

// https://stackoverflow.com/questions/60935519/how-to-know-if-bable-webpack-initial-compilation-finished
const initializedFile: { [key: string]: boolean } = {};

/*
  hack: to trigger update

  here how it works

  1. updateReferences trigger babel update for module that referenced the file
  2. updateSourceFileByPath will be updating this file and dependant module to generate schema
*/

export const updateReferences = (modulePath: string, initialized = false) => {
  if (!initializedFile[modulePath] && !initialized) {
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
