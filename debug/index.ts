// @ts-ignore
import path from 'path';
import { transformFileSync } from '@babel/core';
import plugin from '../src';
import { PluginOptions } from '../src/types';

function transform(filePath: string, options: any = {}, pluginOptions: PluginOptions = {}): string {
  return (
    transformFileSync(filePath, {
      babelrc: false,
      comments: pluginOptions.comments || false,
      configFile: false,
      filename: filePath,
      generatorOpts: {
        jsescOption: { quotes: 'single' },
        quotes: 'single',
      },
      plugins: [[plugin, pluginOptions]],
      ...options,
    }).code || ''
  );
}

const filePath = path.join(__dirname.replace('\\lib', ''), '//TestFile.ts');

const transformed = transform(
  filePath,
  {
    plugins: [plugin, '@babel/plugin-proposal-class-properties'],
    presets: ['@babel/preset-typescript', ['@babel/preset-env', { targets: { ie: '8' } }]],
  },
  { isProduction: true },
);

console.debug(transformed);
export {};
