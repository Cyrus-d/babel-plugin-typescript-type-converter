import { transformFileSync } from '@babel/core';
import plugin from '../../src';
import { PluginOptions } from '../../src/types';

export function transform(
  filePath: string,
  options: any = {},
  pluginOptions: PluginOptions = {},
): string {
  if (options.plugins) {
    options.plugins = options.plugins.map((plg: any) => {
      if (typeof plg === 'function') return [plg, { isProduction: false }];

      return plg;
    });
  }
  if (pluginOptions.isProduction === undefined) pluginOptions.isProduction = false;

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
