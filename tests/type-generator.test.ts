import path from 'path';
import glob from 'fast-glob';
import { transform } from './utils';

jest.mock('chokidar', () => ({
  watch: jest.fn(() => ({
    on: jest.fn(() => {}),
  })),
}));

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
          transform(path.join(__dirname, filePath), {}, { transformReactPropTypesManually: true }),
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

  it('should merge skipParseTypes items', () => {
    expect(
      transform(
        path.join(
          __dirname,
          './fixtures/manual-converter/type-schema/special/skipParseTypes-defaults.ts',
        ),
        {},
        {
          skipParseTypes: ['HTMLElement'],
        },
      ),
    ).toMatchSnapshot();
  });

  it('should merge skipParseTypeInFiles items', () => {
    expect(
      transform(
        path.join(
          __dirname,
          './fixtures/manual-converter/type-schema/special/skipParseTypeInFiles-defaults.ts',
        ),
        {},
        {
          skipParseFiles: ['lib.dom.iterable.d.ts'],
        },
      ),
    ).toMatchSnapshot();
  });
});
