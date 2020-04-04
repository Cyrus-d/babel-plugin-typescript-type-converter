import { ExternalProps } from '../typings';
import { transformTypeToSchema } from '../../../../src/transformerFunctions';

export interface TestProps {
  a: HTMLElement;
  b: string;
}

const type = transformTypeToSchema<TestProps>({ skipParseFiles: ['lib.dom.d.ts'] });
