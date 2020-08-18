import path from 'path';
import glob from 'fast-glob';
import { transform } from './utils';

jest.mock('chokidar', () => ({ watch: jest.fn(() => ({ on: jest.fn(() => {}) })) }));

describe('type-generator', () => {
  glob
    .sync('./fixtures/manual-converter/type-keys/**/*.{ts,tsx}', { cwd: __dirname, dot: false })
    .forEach((basePath) => {
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

  it('should not transforms when disabled by function', () => {
    expect(
      transform(
        path.join(__dirname, './fixtures/manual-converter/type-keys/special/disabled.ts'),
        {},
      ),
    ).toMatchSnapshot();
  });

  it('should not transforms when disabled by globally', () => {
    expect(
      transform(
        path.join(__dirname, './fixtures/manual-converter/type-keys/special/default.ts'),
        {},
        {
          disableGenerateTypeKeysInEnv: ['test'],
        },
      ),
    ).toMatchSnapshot();
  });
});
