import { ExternalProps } from '../typings';
import { transformTypeToSchema } from '../../../../src/transformerFunctions';

export interface TestProps extends ExternalProps {
  prop_a: string;
  prop_b?: string;
}

const type = transformTypeToSchema<TestProps>();
