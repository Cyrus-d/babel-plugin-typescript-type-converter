import { transformTypeToSchema } from '../../../../../src/transformerFunctions';

interface TestProps {
  prop_a: string;
  prop_b?: string;
}

const shouldBeNullValue = transformTypeToSchema<TestProps>({ transformInProduction: false });
const shouldHaveSchema = transformTypeToSchema<TestProps>({ transformInProduction: true });
