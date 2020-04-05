import { transformTypeToSchema } from '../../../../../src/transformerFunctions';

export interface TestProps {
  a: HTMLElement;
  b?: AudioParam;
}

const type = transformTypeToSchema<TestProps>({ skipParseFiles: ['lib.dom.d.ts'] });
