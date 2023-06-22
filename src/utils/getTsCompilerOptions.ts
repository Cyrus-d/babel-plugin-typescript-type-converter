import * as ts from 'typescript';

export const getTsCompilerOptions = () => {
  const tsconfig: ts.CompilerOptions = {
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    module: ts.ModuleKind.CommonJS,
    noEmit: true,
    strictNullChecks: false,
    target: ts.ScriptTarget.ES5,
  };

  return tsconfig;
};
