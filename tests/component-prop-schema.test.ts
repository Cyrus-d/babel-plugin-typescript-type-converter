import path from 'path';
import glob from 'fast-glob';
import { transform } from './utils';

describe('prop schema generator', () => {
  glob
    .sync('./fixtures/manual-converter/component-prop-schema/**/*.{ts,tsx}', {
      cwd: __dirname,
      dot: false,
    })
    .forEach(basePath => {
      const filePath = String(basePath);

      if (filePath.includes('/special/') || filePath.includes('/typings/')) {
        return;
      }
      it(`transforms ${filePath}`, () => {
        expect(
          transform(path.join(__dirname, filePath), {}, { transformReactPropTypesManually: true }),
        ).toMatchSnapshot();
      });
    });

  it('should generate prop schema in production', () => {
    expect(
      transform(
        path.join(
          __dirname,
          './fixtures/manual-converter/component-prop-schema/special/component-prop-schema-production.ts',
        ),
        {},
        {
          isProduction: true,
        },
      ),
    ).toMatchSnapshot();
  });

  it('should always generate prop schema in production', () => {
    expect(
      transform(
        path.join(
          __dirname,
          './fixtures/manual-converter/component-prop-schema/special/component-prop-schema-production-global.ts',
        ),
        {},
        {
          isProduction: true,
          transformReactPropTypesManually: true,
          transformReactPropSchemaInProduction: true,
        },
      ),
    ).toMatchSnapshot();
  });
});
