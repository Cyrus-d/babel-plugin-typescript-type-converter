import { transformTypeToKeys } from '../../../../../src/transformerFunctions';

interface TestProps {
  prop_a: string;
  prop_b?: string;
}

const shouldBeNullValue = transformTypeToKeys<TestProps>({ transformInProduction: false });
const shouldHaveKeys = transformTypeToKeys<TestProps>({ transformInProduction: true });
