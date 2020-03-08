import { getSchemaFormType } from '../../../../../src/generatorFunctions';

interface TestProps {
  prop_a: string;
  prop_b?: string;
}

const shouldBeNullValue = getSchemaFormType<TestProps>({ generateInProduction: false });
const shouldHaveSchema = getSchemaFormType<TestProps>({ generateInProduction: true });
