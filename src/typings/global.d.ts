declare module '@babel/helper-plugin-utils';
declare module '@babel/helper-module-imports';
declare module '@babel/plugin-syntax-typescript';

declare module '@babel/core' {
  // eslint-disable-next-line import/no-unresolved
  import * as traverse from 'babel-traverse';

  export { traverse };
  // eslint-disable-next-line import/no-unresolved
  export * from 'babel-core';
}
