import path from 'path';
import { transform } from './utils';

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

  it('should not transforms when is in Production', () => {
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

  it('should not transforms when transformReactPropTypesManually=true', () => {
    expect(
      transform(
        path.join(__dirname, './fixtures/manual-converter/prop-types/component-prop-schema.ts'),
        {},
        {
          transformReactPropTypesManually: true,
        },
      ),
    ).toMatchSnapshot();
  });

  it('should transforms when transformReactPropTypesInProduction=true', () => {
    expect(
      transform(
        path.join(__dirname, './fixtures/manual-converter/prop-types/component-prop-schema.ts'),
        {},
        {
          transformReactPropTypesInProduction: true,
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
          transformReactPropTypesManually: true,
        },
      ),
    ).toMatchSnapshot();
  });
});
