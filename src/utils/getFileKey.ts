/* eslint-disable require-unicode-regexp */
import path from 'path';

export const getFileKey = (fileName: string) => path.normalize(fileName).replace(/\\/g, '/');
