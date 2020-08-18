import path from 'path';
import glob from 'fast-glob';
import { transform } from './utils';

jest.mock('chokidar', () => ({ watch: jest.fn(() => ({ on: jest.fn(() => {}) })) }));

describe('prop schema generator', () => {
  glob
    .sync('./fixtures/manual-converter/component-prop-schema/**/*.{ts,tsx}', {
      cwd: __dirname,
      dot: false,
    })
    .forEach((basePath) => {
      const filePath = String(basePath);

      if (filePath.includes('/special/') || filePath.includes('/typings/')) {
        return;
      }
      it(`transforms ${filePath}`, () => {
        expect(
          transform(path.join(__dirname, filePath), {}, { generateReactPropTypesManually: true }),
        ).toMatchSnapshot();
      });
    });

  it('should not generate prop schema if disabled by function', () => {
    expect(
      transform(
        path.join(
          __dirname,
          './fixtures/manual-converter/component-prop-schema/special/component-prop-schema.ts',
        ),
        {},
      ),
    ).toMatchSnapshot();
  });

  it('should not generate prop schema if disabled', () => {
    expect(
      transform(
        path.join(
          __dirname,
          './fixtures/manual-converter/component-prop-schema/special/component-prop-schema-global.ts',
        ),
        {},
        {
          generateReactPropTypesManually: true,
          disableGenerateReactPropSchemaInEnv: ['test'],
        },
      ),
    ).toMatchSnapshot();
  });
});
