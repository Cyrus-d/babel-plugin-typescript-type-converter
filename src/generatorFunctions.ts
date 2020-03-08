import { GeneratorOptions } from './typings';

export function generateComponentPropsSchema<T>(component: T, options?: GeneratorOptions<T>) {}

export function getSchemaFormType<T>(options?: GeneratorOptions<T>) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {} as T;
}

export function generateComponentPropTypes<T>(component: T) {}

type TypeKeysOptions<T> = Pick<GeneratorOptions<T>, Exclude<keyof GeneratorOptions<T>, 'maxDepth'>>;

export function getTypeKeys<T>(options?: TypeKeysOptions<T>) {
  return ([] as unknown) as keyof T;
}
