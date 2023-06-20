/* eslint-disable require-unicode-regexp */
import { watch } from 'chokidar';

export const getWatcher = (path: string) => {
  return watch(path, {
    awaitWriteFinish: {
      pollInterval: 100,
      stabilityThreshold: 1000,
    },
    disableGlobbing: true,
    ignored: /node_modules/,
    ignoreInitial: true,
    persistent: true,
  });
};
