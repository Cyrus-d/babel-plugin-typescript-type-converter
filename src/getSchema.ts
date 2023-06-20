/* eslint-disable require-unicode-regexp */
/* eslint-disable no-plusplus */
/* eslint-disable no-magic-numbers */
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
  createProgram,
  sourceFileCacheInstance,
} from './utils';

import { ConvertState, Path, PluginOptions } from './types';
import { TransformerOptions } from './typings';
import { transformerDependencyManager } from './TransformerDependencyManager';
import { processFilePath } from './fileWatcher';
import { isCompilationComplete } from './utils/isCompilationComplete';

const getMessage = (filePath: string) => `\nconverting type > ${path.basename(filePath)}`;

export const getSchema = (
  projectRootPath: string,
  filePath: string,
  propName: string,
  options: PluginOptions,
): tsJson.Definition | undefined => {
  const { shouldParseNode, ...rest } = options;

  const config: tsJson.Config = {
    allowArbitraryDataTypes: true,
    expose: 'none',
    handleUnknownTypes: true,
    jsDoc: 'none',
    path: filePath,
    shouldParseNode: (node: any) => {
      // const path = node.getSourceFile().fileName;
      // setModuleReferences
      // transformerDependencyManager.addDependency(projectRootPath, filePath, path);

      if (shouldParseNode) shouldParseNode(node);

      return true;
    },
    skipTypeCheck: true,
    topRef: true,
    type: propName,
    ...rest,
  };

  sourceFileCacheInstance.updateSourceFileByPath(filePath);

  processFilePath(projectRootPath, filePath);

  if (isCompilationComplete()) {
    // const input = process.argv[2];
    // const endsWithNewLine = /\n$/.test(input);
    const msg = getMessage(filePath);
    console.time(msg);
  }

  // if (sourceFileCacheInstance.initialized()) {
  //   sourceFileCacheInstance.updateSourceFileByPath(filePath);
  // } else {
  //   sourceFileCacheInstance.initializeSourceFiles(config, filePath);
  // }

  try {
    const program = createProgram(filePath);

    const generator = new tsJson.SchemaGenerator(
      program as any,
      tsJson.createParser(program as any, config),
      tsJson.createFormatter(config),
      config,
    );

    const schema = generator.createSchema(config.type);

    if (isCompilationComplete()) {
      console.timeEnd(getMessage(filePath));
    }

    return schema;
  } catch (error) {
    console.error(error);

    return {};
  }
};

export function getSchemaObject<T>(
  projectRootPath: string,
  node: t.CallExpression,
  state: ConvertState,
  typeNames: string[],
  options?: TransformerOptions<T>,
) {
  const newOptions = deepmerge(state.options, options as any);

  const schemaArr = typeNames.map((p) => getSchema(projectRootPath, state.filePath, p, newOptions));

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
  projectRootPath: string,
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

  const schema = getSchemaObject(projectRootPath, node, state, typeNames, options);

  if (!schema || !schema.properties) {
    setNullValue(path, id);

    return;
  }

  const keys = Object.keys(schema.properties);
  const keysAst = astConverter(keys);
  path.replaceWith(t.variableDeclaration(path.node.kind, [t.variableDeclarator(id, keysAst)]));
};

export const generateTypeSchema = (
  projectRootPath: string,
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

  const schema = getSchemaObject(projectRootPath, node, state, typeNames, options);
  const schemaObject = astConverter(schema);
  path.replaceWith(t.variableDeclaration(path.node.kind, [t.variableDeclarator(id, schemaObject)]));
};

export function generateComponentPropSchema<
  T extends Path<any>,
  S extends ConvertState,
  P extends t.TSIntersectionType | t.TSTypeReference | t.TSUnionType | undefined,
>(
  projectRootPath: string,
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
    const schema = getSchemaObject(projectRootPath, generatorNode, state, typeNames, options);

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
