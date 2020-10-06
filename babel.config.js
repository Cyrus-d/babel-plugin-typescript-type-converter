module.exports = {
  babelrc: false,
  comments: false,
  ignore: ['tests/fixtures/**/*.js'],
  plugins: [
    [
      '@babel/plugin-proposal-class-properties',
      {
        loose: true,
      },
    ],
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-catch-binding',
    '@babel/plugin-proposal-optional-chaining',
    [
      'babel-plugin-transform-dev',
      {
        evaluate: false,
      },
    ],
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        loose: true,
        modules: 'commonjs',
        shippedProposals: true,
        targets: {
          node: '8.9.0',
        },
      },
    ],
    [
      '@babel/preset-typescript',
      {
        onlyRemoveTypeImports: true,
      },
    ],
  ],
  sourceType: 'module',
};
