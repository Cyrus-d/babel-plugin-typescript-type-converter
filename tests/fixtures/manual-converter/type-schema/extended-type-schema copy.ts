import { ExternalProps } from '../typings';
import { getSchemaFormType } from '../../../../src/generatorFunctions';

interface TestProps extends ExternalProps {
  prop_a: string;
  prop_b?: string;
}

const type = getSchemaFormType<TestProps>();
