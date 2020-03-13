import path from 'path';
import glob from 'fast-glob';
import { transform } from './utils';

describe('type-generator', () => {
  glob
    .sync('./fixtures/manual-converter/type-schema/**/*.{ts,tsx}', { cwd: __dirname, dot: false })
    .forEach(basePath => {
      const filePath = String(basePath);

      if (filePath.includes('/special/')) {
        return;
      }
      it(`transforms ${filePath}`, () => {
        expect(
          transform(path.join(__dirname, filePath), {}, { generateReactPropTypesManually: true }),
        ).toMatchSnapshot();
      });
    });

  it('should not transforms in production when disabled', () => {
    expect(
      transform(
        path.join(
          __dirname,
          './fixtures/manual-converter/type-schema/special/production-schema.ts',
        ),
        {},
        {
          isProduction: true,
        },
      ),
    ).toMatchSnapshot();
  });
});
