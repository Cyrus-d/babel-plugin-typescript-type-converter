import * as tsJson from 'ts-to-json';
import { types as t } from '@babel/core';
import astConverter from 'babel-object-to-ast';
import * as ts from 'typescript';

import { getGeneratorOptions, getNodeTypesNames, mergeSchema, getTsTypeName } from './utils';

import { ConvertState, Path, PluginOptions } from './types';
import { GeneratorOptions } from './typings';

const typeCaches = new Map<string, tsJson.Definition>();
const programCache = new Map<string, ts.Program>();

export const getSchema = (state: ConvertState, propName: string): tsJson.Definition | undefined => {
  const typeCacheKey = state.filePath + propName + state.options.maxDepth;
  const programCacheKey = state.filePath;

  if (typeCaches.get(typeCacheKey)) {
    return typeCaches.get(typeCacheKey);
  }

  const config: tsJson.Config = {
    expose: 'none',
    jsDoc: 'none',
    maxDepth: state.options.maxDepth,
    path: state.filePath,
    skipTypeCheck: true,
    topRef: true,
    type: propName,
    useTypescriptTypeName: true,
  };

  let program: ts.Program | undefined = programCache.get(programCacheKey);

  if (!program) {
    program = tsJson.createProgram(config);
  }

  programCache.set(programCacheKey, program);

  const generator = new tsJson.SchemaGenerator(
    program,
    tsJson.createParser(program, config),
    tsJson.createFormatter(config),
    config,
  );

  const schema = generator.createSchema(config.type);

  typeCaches.set(typeCacheKey, schema);

  return schema;
};

const excludeProps = (schema: tsJson.Definition, excludeProps: any[]) => {
  excludeProps.forEach(prop => {
    if (schema.properties) delete schema.properties[prop];
    if (schema.required) schema.required = schema.required.filter(x => x !== prop);
  });
};

const includeProps = (schema: tsJson.Definition, includeProps: any[]) => {
  if (!schema.properties) return;
  Object.keys(schema.properties).forEach(prop => {
    if (!includeProps.includes(prop)) {
      if (schema.properties) delete schema.properties[prop];
      if (schema.required) schema.required = schema.required.filter(x => x !== prop);
    }
  });
};

export function getSchemaObject<T>(
  node: t.CallExpression,
  state: ConvertState,
  typeNames: string[],
  options?: GeneratorOptions<T>,
) {
  if (options && options.maxDepth) state.options.maxDepth = options?.maxDepth;

  const schemaArr = typeNames.map(p => getSchema(state, p));

  if (!schemaArr) return null;

  const mergedSchema = mergeSchema(schemaArr as tsJson.Definition[]);

  if (!mergedSchema.properties) return null;

  if (options?.excludeProps) excludeProps(mergedSchema, options?.excludeProps);
  if (options?.includeProps) includeProps(mergedSchema, options?.includeProps);

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
  const options = getGeneratorOptions(node);

  if (options?.generateInProduction === false && pluginOptions.isProduction) {
    setNullValue(path, id);

    return;
  }

  const schema = getSchemaObject(node, state, typeNames, options);

  if (!schema.properties) {
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
  const options = getGeneratorOptions(node);

  if (options?.generateInProduction === false && pluginOptions.isProduction) {
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
  P extends t.TSIntersectionType | t.TSTypeReference | t.TSUnionType | undefined
>(
  componentName: string,
  rootPath: T,
  state: S,
  generatorNode: t.CallExpression,
  pluginOptions: PluginOptions,
  propTypes?: P,
) {
  if (!propTypes) return;
  const options = getGeneratorOptions(generatorNode);

  if (
    !pluginOptions.isProduction ||
    pluginOptions.generateReactPropsSchemaInProduction ||
    options?.generateInProduction
  ) {
    const typeNames = getTsTypeName(propTypes as t.TSIntersectionType);
    const schema = getSchemaObject(generatorNode, state, typeNames, options);

    if (!schema) return;

    const schemaObject = astConverter(schema);

    rootPath.insertAfter(
      t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.memberExpression(t.identifier(componentName), t.identifier('__propsSchema')),
          schemaObject,
        ),
      ),
    );
  }
}
