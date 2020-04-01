import { transformTypeToSchema } from '../../../../src/transformerFunctions';

export interface TestProps {
  level_1: {
    level_2: {
      level_3: string;
    };
  };
}

const type4 = transformTypeToSchema<TestProps>({ maxDepth: 2 });
