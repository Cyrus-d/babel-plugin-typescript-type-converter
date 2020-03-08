import { getSchemaFormType } from '../../../../src/generatorFunctions';

interface TestProps {
  prop_a: string;
  prop_b?: string;
}

const type = getSchemaFormType<TestProps>();
const type2 = getSchemaFormType<TestProps>({ excludeProps: ['prop_b'] });
const type3 = getSchemaFormType<TestProps>({ includeProps: ['prop_b'] });
