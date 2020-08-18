import path from 'path';
import { transform } from './utils';

describe('prop types', () => {
  it('should transforms', () => {
    expect(
      transform(
        path.join(__dirname, './fixtures/manual-converter/prop-types/component-prop-schema.ts'),
        {},
        {
          // isProduction: false,
        },
      ),
    ).toMatchSnapshot();
  });

  it('should not transforms when disabled', () => {
    expect(
      transform(
        path.join(__dirname, './fixtures/manual-converter/prop-types/component-prop-schema.ts'),
        {},
        {
          disableGenerateReactPropTypesInEnv: ['test'],
        },
      ),
    ).toMatchSnapshot();
  });

  it('should not transforms when transformReactPropTypesManually=true', () => {
    expect(
      transform(
        path.join(__dirname, './fixtures/manual-converter/prop-types/component-prop-schema.ts'),
        {},
        {
          generateReactPropTypesManually: true,
        },
      ),
    ).toMatchSnapshot();
  });

  it('should generate prop-types manually', () => {
    expect(
      transform(
        path.join(
          __dirname,
          './fixtures/manual-converter/prop-types/component-prop-schema-manual.ts',
        ),
        {},
        {
          generateReactPropTypesManually: true,
        },
      ),
    ).toMatchSnapshot();
  });
});
