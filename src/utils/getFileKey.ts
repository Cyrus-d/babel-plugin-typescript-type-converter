export const getFileKey = (fileName: string) =>
  fileName
    .split('/')
    .join('_')
    .split('\\')
    .join('_');
