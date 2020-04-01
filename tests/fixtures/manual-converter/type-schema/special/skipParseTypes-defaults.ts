import { transformTypeToSchema } from '../../../../../src/transformerFunctions';

export interface TestProps {
  a: HTMLElement;
  b?: HTMLDivElement;
}

const type = transformTypeToSchema<TestProps>({ skipParseTypes: ['HTMLDivElement'] });
