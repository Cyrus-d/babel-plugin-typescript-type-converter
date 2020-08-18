export const shouldTransform = (env?: string[]) => {
  if (!env || !process.env.NODE_ENV) return true;

  return !env.includes(process.env.NODE_ENV);
};
