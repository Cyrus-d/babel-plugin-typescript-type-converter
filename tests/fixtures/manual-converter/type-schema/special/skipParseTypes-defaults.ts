import { transformTypeToSchema } from '../../../../../src/transformerFunctions';

interface TestProps {
  a: HTMLElement;
  b?: HTMLDivElement;
}

const type = transformTypeToSchema<TestProps>({ skipParseTypes: ['HTMLDivElement'] });
