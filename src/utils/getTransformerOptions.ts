import { types as t } from '@babel/core';
import { TransformerOptions } from '../typings';

interface Option {
  [key: string]: any;
}

const setArrayOption = (prop: t.ObjectProperty, opts: Option) => {
  if (!t.isArrayExpression(prop.value)) return;

  if (t.isIdentifier(prop.key)) {
    opts[prop.key.name] = prop.value.elements.reduce((arr, elm) => {
      if (t.isStringLiteral(elm)) arr.push(elm.value);

      return arr;
    }, [] as string[]);
  }
};

const setOtherOptions = (prop: t.ObjectProperty, opts: Option) => {
  if (
    !t.isNumericLiteral(prop.value) &&
    !t.isStringLiteral(prop.value) &&
    !t.isBooleanLiteral(prop.value)
  )
    return;

  if (t.isIdentifier(prop.key)) {
    opts[prop.key.name] = prop.value.value;
  }
};

export const getTransformerOptions = <T extends t.CallExpression>(
  node: T,
): TransformerOptions<T> => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  if (!node.arguments) return {} as TransformerOptions<T>;

  return node.arguments.reduce((opts, arg) => {
    if (t.isObjectExpression(arg)) {
      arg.properties.forEach(prop => {
        if (t.isObjectProperty(prop)) {
          setArrayOption(prop, opts);
          setOtherOptions(prop, opts);
        }
      });
    }

    return opts;
  }, {} as TransformerOptions<{}>);
};
