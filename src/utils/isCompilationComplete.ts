/* eslint-disable no-magic-numbers */
import { debounce } from 'lodash';

let isCompiling = true;

export const onCompileFile = debounce(() => {
  isCompiling = false;
}, 5000);

export const isCompilationComplete = () => {
  return !isCompiling;
};
