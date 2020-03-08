import { getSchemaFormType } from '../../../../src/generatorFunctions';

interface TestProps {
  level_1: {
    level_2: {
      level_3: string;
    };
  };
}

const type4 = getSchemaFormType<TestProps>({ maxDepth: 2 });
