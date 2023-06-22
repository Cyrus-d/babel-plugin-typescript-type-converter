/* eslint-disable require-unicode-regexp */
import path from 'path';

export const normalizeFilePath = (fileName: string) => path.normalize(fileName).replace(/\\/g, '/');
