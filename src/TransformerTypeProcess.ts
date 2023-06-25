import * as tsJson from 'ts-to-json';
import * as ts from 'typescript';
import path from 'path';
import {
  findTransformerFunction,
  getRootFiles,
  getTsCompilerOptions,
  getTsToJsonConfig,
} from './utils';
import { PluginOptionsInternal } from './types';
import { TransformerFunctionToDependenciesMap } from './typings';

process.stdin.setEncoding('utf-8');

const tsconfig: ts.CompilerOptions = getTsCompilerOptions();

process.stdin.on('data', (data: string) => {
  // Process the received string
  // const root = data.trim();
  const { root, ignore = [], shouldParseNode, ...rest } = JSON.parse(data) as PluginOptionsInternal;

  const files = getRootFiles(root, ignore);

  const program = ts.createProgram(files, { ...tsconfig, rootDir: root });

  const sourceFiles = program.getSourceFiles();

  const transformerDependencies: TransformerFunctionToDependenciesMap = {};

  const filesRecord = files.reduce((o, f) => {
    o[f] = true;

    return o;
  }, {} as Record<string, true>);

  sourceFiles
    .filter((sourceFile) => filesRecord[path.normalize(sourceFile.fileName)])
    .forEach((sourceFile) => {
      const transformerFunctions = findTransformerFunction(sourceFile);
      transformerFunctions.forEach(({ types }) => {
        types.forEach((transformerType) => {
          const filePath = sourceFile.fileName;
          const config: tsJson.Config = getTsToJsonConfig(
            {
              path: filePath,
              type: transformerType.name,
              ...rest,
            },
            (node) => {
              const path = node.getSourceFile().fileName;
              if (!transformerDependencies[filePath]) {
                transformerDependencies[filePath] = [];
              }

              if (!transformerDependencies[filePath].includes(path)) {
                transformerDependencies[filePath].push(path);
              }
            },
          );

          try {
            const generator = new tsJson.SchemaGenerator(
              program,
              tsJson.createParser(program as any, config),
              tsJson.createFormatter(config),
              config,
            );

            generator.createSchema(config.type);
          } catch (error) {
            // throw error;
            //
          }
        });
      });
    });

  process.stdout.write(JSON.stringify(transformerDependencies));
});
