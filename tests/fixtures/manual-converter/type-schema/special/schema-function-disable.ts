import { transformTypeToSchema } from '../../../../../src/transformerFunctions';

export interface TestProps {
  prop_a: string;
  prop_b?: string;
}

const shouldBeNullValue = transformTypeToSchema<TestProps>({ disableTransformInEnv: ['test'] });
