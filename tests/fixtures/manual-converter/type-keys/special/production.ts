import { transformTypeToKeys } from '../../../../../src/transformerFunctions';

interface TestProps {
  prop_a: string;
  prop_b?: string;
}

const shouldBeNullValue = transformTypeToKeys<TestProps>({ generateInProduction: false });
const shouldHaveKeys = transformTypeToKeys<TestProps>({ generateInProduction: true });
