/* eslint-disable no-console */

import * as tsJson from 'ts-to-json';
import { types as t } from '@babel/core';
import astConverter from 'babel-object-to-ast';
import deepmerge from 'deepmerge';
import path from 'path';
import {
  getTransformerOptions,
  getNodeTypesNames,
  mergeSchema,
  getTsTypeName,
  shouldTransform,
  getTsToJsonConfig,
} from './utils';
import { ConvertState, Path, PluginOptions } from './types';
import { TransformerOptions } from './typings';
import { getTransformerDependencyWatcher } from './TransformerDependencyWatcher';
import { isCompilationComplete } from './utils/isCompilationComplete';
import { sourceFileCache } from './SourceFileCache';
import { createProgram } from './createProgram';

const getMessage = (filePath: string) => `\nconvert type > ${path.basename(filePath)}`;

export const getSchema = (
  filePath: string,
  propName: string,
  options: PluginOptions,
): tsJson.Definition | undefined => {
  const { shouldParseNode, ...rest } = options;

  const config: tsJson.Config = getTsToJsonConfig(
    {
      path: filePath,
      type: propName,
      ...rest,
    },
    (node) => {
      const path = node.getSourceFile().fileName;
      getTransformerDependencyWatcher().addDependency(filePath, path);
    },
  );

  sourceFileCache.updateSourceFileByPath(filePath);

  if (isCompilationComplete() && options.showDebugMessages) {
    // const input = process.argv[2];
    // const endsWithNewLine = /\n$/.test(input);
    process.stdout.write(getMessage(filePath));
    console.time(' ');
  }

  try {
    const program = createProgram(filePath);

    const generator = new tsJson.SchemaGenerator(
      program as any,
      tsJson.createParser(program as any, config),
      tsJson.createFormatter(config),
      config,
    );

    const schema = generator.createSchema(config.type);

    if (isCompilationComplete() && options.showDebugMessages) {
      console.timeEnd(' ');
    }

    return schema;
  } catch (error) {
    console.error(error);

    return {};
  }
};

export function getSchemaObject<T>(
  node: t.CallExpression,
  state: ConvertState,
  typeNames: string[],
  options?: TransformerOptions<T>,
) {
  const newOptions = deepmerge(state.options, options as any);

  const schemaArr = typeNames.map((p) => getSchema(state.filePath, p, newOptions));

  if (!schemaArr) return null;

  const mergedSchema = mergeSchema(schemaArr as tsJson.Definition[]) || {};

  if (!mergedSchema.properties) return null;

  return mergedSchema;
}

const setNullValue = (path: Path<any>, id: t.Identifier) => {
  path.replaceWith(
    t.variableDeclaration(path.node.kind, [t.variableDeclarator(id, t.nullLiteral())]),
  );
};

export const generateTypeKeys = (
  id: t.Identifier,
  path: Path<any>,
  node: t.CallExpression,
  state: ConvertState,
  pluginOptions: PluginOptions,
) => {
  const typeNames = getNodeTypesNames(node);
  const options = getTransformerOptions(node);

  if (
    !shouldTransform(pluginOptions.disableGenerateTypeKeysInEnv) ||
    !shouldTransform(options.disableTransformInEnv)
  ) {
    setNullValue(path, id);

    return;
  }

  const schema = getSchemaObject(node, state, typeNames, options);

  if (!schema || !schema.properties) {
    setNullValue(path, id);

    return;
  }

  const keys = Object.keys(schema.properties);
  const keysAst = astConverter(keys);
  path.replaceWith(t.variableDeclaration(path.node.kind, [t.variableDeclarator(id, keysAst)]));
};

export const generateTypeSchema = (
  id: t.Identifier,
  path: Path<any>,
  node: t.CallExpression,
  state: ConvertState,
  pluginOptions: PluginOptions,
) => {
  const typeNames = getNodeTypesNames(node);
  const options = getTransformerOptions(node);

  if (
    !shouldTransform(pluginOptions.disableGenerateTypeSchemaInEnv) ||
    !shouldTransform(options.disableTransformInEnv)
  ) {
    setNullValue(path, id);

    return;
  }

  const schema = getSchemaObject(node, state, typeNames, options);
  const schemaObject = astConverter(schema);
  path.replaceWith(t.variableDeclaration(path.node.kind, [t.variableDeclarator(id, schemaObject)]));
};

export function generateComponentPropSchema<
  T extends Path<any>,
  S extends ConvertState,
  P extends t.TSIntersectionType | t.TSTypeReference | t.TSUnionType | undefined,
>(
  componentName: string,
  rootPath: T,
  state: S,
  generatorNode: t.CallExpression,
  pluginOptions: PluginOptions,
  propTypes?: P,
) {
  if (!propTypes) return;
  const options = getTransformerOptions(generatorNode);

  if (
    shouldTransform(pluginOptions.disableGenerateReactPropSchemaInEnv) &&
    shouldTransform(options.disableTransformInEnv)
  ) {
    const typeNames = getTsTypeName(propTypes as t.TSIntersectionType);
    const schema = getSchemaObject(generatorNode, state, typeNames, options);

    if (!schema) return;

    const schemaObject = astConverter(schema);

    rootPath.insertAfter(
      t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.memberExpression(t.identifier(componentName), t.identifier('__propSchema')),
          schemaObject,
        ),
      ),
    );
  }
}
