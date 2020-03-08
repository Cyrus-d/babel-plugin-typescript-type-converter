import { getTypeKeys } from '../../../../src/generatorFunctions';

interface TestProps {
  prop_a: string;
  prop_b?: string;
}

const includeProp_b = getTypeKeys<TestProps>({ includeProps: ['prop_b'] });
const excludeProp_b = getTypeKeys<TestProps>({ excludeProps: ['prop_b'] });
