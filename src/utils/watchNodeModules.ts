/* eslint-disable no-magic-numbers */
import { watch } from 'chokidar';
import debounce from 'lodash/debounce';
// import { deleteModuleReference } from './moduleDependencies';
import { updateReferences } from './updateReferences';
import { createOrUpdateSourceFile } from './sourceFile';

const update = (event: string, path: string) => {
  if (event === 'unlink' || event === 'unlinkDir') {
    // sometime cause problem when updating package, because file will be removed first than replaced
    // deleteModuleReference(path);
    return;
  }
  createOrUpdateSourceFile(path, true);
  updateReferences(path);
};

const denounced = debounce(update, 1000);

export const watchNodeModules = (root: string) => {
  if (!root.includes('node_modules')) return;

  const watcher = watch(root, {
    awaitWriteFinish: {
      pollInterval: 100,
      stabilityThreshold: 1000,
    },
    disableGlobbing: true,
    ignoreInitial: true,
  });

  watcher.on('all', denounced);
};
