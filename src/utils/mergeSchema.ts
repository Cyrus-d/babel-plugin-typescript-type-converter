import { Definition } from 'ts-to-json';
import merge from 'deepmerge';

export const mergeSchema = (schemaArr: Definition[]) => {
  const mergedSchema = schemaArr.reduce((obj, schema) => {
    if (!schema || !schema.definitions) return;

    const { definitions } = schema;
    const defPropsSchema = Object.keys(schema.definitions).reduce((schemaObj, key) => {
      const defPropSchema = definitions[key] as Definition;
      schemaObj = merge(schemaObj, defPropSchema);

      return schemaObj;
    }, {} as Definition);
    obj = merge(obj, defPropsSchema);
    if (obj.required) obj.required = [...new Set(obj.required)];

    // eslint-disable-next-line consistent-return
    return obj;
  }, {} as any);

  return mergedSchema;
};
