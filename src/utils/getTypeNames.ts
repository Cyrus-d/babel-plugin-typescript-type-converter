import { types as t } from '@babel/core';

const getTSTypeReferenceTypeName = (node: t.TSTypeReference) => {
  if (t.isIdentifier(node.typeName)) {
    return node.typeName.name;
  }

  return null;
};

const getIntersectionTypeNames = (node: t.TSIntersectionType) => {
  const typeNames = node.types.reduce((arr, type) => {
    if (t.isTSTypeReference(type)) {
      const typeName = getTSTypeReferenceTypeName(type);
      if (typeName) arr.push(typeName);
    }

    return arr;
  }, [] as string[]);

  return typeNames;
};

export const getTsTypeName = (node: t.TSType) => {
  let typeNames: string[] = [];
  if (t.isTSTypeReference(node)) {
    const typeName = getTSTypeReferenceTypeName(node);
    if (typeName) typeNames.push(typeName);
  } else if (t.isTSIntersectionType(node)) {
    typeNames = getIntersectionTypeNames(node);
  }

  return typeNames;
};

const getTypeParametersTypeNames = (typeParameters: t.TSTypeParameterInstantiation) => {
  return typeParameters.params.reduce((arr, param) => {
    return getTsTypeName(param);
  }, [] as string[]);
};

export const getNodeTypesNames = (node: t.Node) => {
  if (t.isCallExpression(node)) {
    return getTypeParametersTypeNames((node as any).typeParameters);
  }

  return [];
};
