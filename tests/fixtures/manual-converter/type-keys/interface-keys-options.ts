import { transformTypeToKeys } from '../../../../src/transformerFunctions';

interface TestProps {
  prop_a: string;
  prop_b?: string;
}

const includeProp_b = transformTypeToKeys<TestProps>({ includeProps: ['prop_b'] });
const excludeProp_b = transformTypeToKeys<TestProps>({ excludeProps: ['prop_b'] });
