import { transformTypeToSchema } from '../../../../src/transformerFunctions';

export interface TestProps {
  prop_a: string;
  prop_b?: string;
}

const type = transformTypeToSchema<TestProps>();
const type2 = transformTypeToSchema<TestProps>({ skipParsePropTypes: ['prop_b'] });
const type3 = transformTypeToSchema<TestProps>({ includeProps: ['prop_b'] });
