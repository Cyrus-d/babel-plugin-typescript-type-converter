import ts from 'typescript';
import path from 'path';

import { spawn } from 'child_process';
import { PluginOptionsInternal } from './types';
import {
  getTransformerDependencyWatcher,
  instantiateTransformerDependencyWatcher,
} from './TransformerDependencyWatcher';
import { sourceFileCache } from './SourceFileCache';
import { TransformerFunctionToDependenciesMap } from './typings';
import { getRootFiles, getTsCompilerOptions } from './utils';

let init = false;

const tsconfig: ts.CompilerOptions = getTsCompilerOptions();

const startTransformerProcess = (options: PluginOptionsInternal) => {
  const child = spawn('node', ['TransformerTypeProcess.js'], { cwd: __dirname });

  child.stdin.write(JSON.stringify(options));
  child.stdin.end();

  child.stdout.on('data', (data) => {
    try {
      const transDepsMap: TransformerFunctionToDependenciesMap = JSON.parse(
        data,
      ) as TransformerFunctionToDependenciesMap;

      Object.entries(transDepsMap).forEach(([transformerKey, dependencies]) => {
        dependencies.forEach((dependency) => {
          getTransformerDependencyWatcher().addDependency(transformerKey, dependency);
        });
      });
    } catch (error) {
      console.log(error);
    }
  });

  child.stderr.on('data', (data) => {
    console.error(`Error: ${data}`);
  });

  child.on('close', (code) => {
    console.log(`Mapping transformer function to dependencies complete.`);
  });
};

export const initializeTypeTransformer = (options: PluginOptionsInternal) => {
  if (!init) {
    init = true;
    const { ignore = [], root } = options;

    const files = getRootFiles(root, ignore);

    const program = ts.createProgram(files, tsconfig);

    const filesRecord = files.reduce((o, f) => {
      o[f] = true;

      return o;
    }, {} as Record<string, true>);

    const sourceFiles = program.getSourceFiles();
    const rootSourceFiles: ts.SourceFile[] = [];
    // console.log(files);
    // let cnt = 0;
    sourceFiles.forEach((sourceFile) => {
      if (filesRecord[sourceFile.fileName]) {
        rootSourceFiles.push(sourceFile);
      }
      const sourceFilePath = path.resolve(root, sourceFile.fileName);
      sourceFileCache.addSourceFile(sourceFilePath, sourceFile);
    });

    if (process.env.NODE_ENV !== 'test') {
      startTransformerProcess(options);
    }
  }

  instantiateTransformerDependencyWatcher(options);
};
