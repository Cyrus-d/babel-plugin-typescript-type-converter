import { getTypeKeys } from '../../../../src/generatorFunctions';

interface TestProps {
  prop_a: string;
  prop_b?: string;
}

const type = getTypeKeys<TestProps>();
