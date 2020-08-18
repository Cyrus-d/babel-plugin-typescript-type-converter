import { transformTypeToKeys } from '../../../../../src/transformerFunctions';

export interface TestProps {
  prop_a: string;
  prop_b?: string;
}

const typeKeys = transformTypeToKeys<TestProps>();
