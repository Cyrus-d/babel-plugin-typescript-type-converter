import { transformTypeToSchema } from '../../../../../src/transformerFunctions';

interface TestProps {
  a: HTMLElement;
  b?: AudioParam;
}

const type = transformTypeToSchema<TestProps>({ skipParseTypeInFiles: ['lib.dom.d.ts'] });
