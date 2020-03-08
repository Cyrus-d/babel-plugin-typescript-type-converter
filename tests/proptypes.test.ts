import { transform } from './utils';
import path from 'path';

describe('prop types', () => {
  it('should transforms when is not in production', () => {
    expect(
      transform(
        path.join(__dirname, './fixtures/manual-converter/prop-types/component-prop-schema.ts'),
        {},
        {
          isProduction: false,
        },
      ),
    ).toMatchSnapshot();
  });

  it('should not transforms when is in Production ', () => {
    expect(
      transform(
        path.join(__dirname, './fixtures/manual-converter/prop-types/component-prop-schema.ts'),
        {},
        {
          isProduction: true,
        },
      ),
    ).toMatchSnapshot();
  });

  it('should not transforms when generateReactPropTypesManually=true ', () => {
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

  it('should transforms when generateReactPropTypesInProduction=true', () => {
    expect(
      transform(
        path.join(__dirname, './fixtures/manual-converter/prop-types/component-prop-schema.ts'),
        {},
        {
          generateReactPropTypesInProduction: true,
          isProduction: true,
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
