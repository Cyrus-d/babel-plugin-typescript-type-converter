import { getTypeKeys } from '../../../../../src/generatorFunctions';

interface TestProps {
  prop_a: string;
  prop_b?: string;
}

const shouldBeNullValue = getTypeKeys<TestProps>({ generateInProduction: false });
const shouldHaveKeys = getTypeKeys<TestProps>({ generateInProduction: true });
