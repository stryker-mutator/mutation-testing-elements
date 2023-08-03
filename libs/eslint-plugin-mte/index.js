module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    project: true,
  },
  rules: {
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',

    // Not useful for a lot of stuff, but mainly `.shadowRoot`
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:@typescript-eslint/recommended-type-checked',
    'prettier',
  ],
  env: {
    node: true,
    es6: true,
  },
  ignorePatterns: [
    'webpack.*.js',
    '*.conf.js',
    '*.config.js',
    'tsconfig-transpiler.js',
    'node_modules',
    'dist',
    'dist-test',
    'src-generated',
    '.stryker-tmp',
    'reports',
    'testResources',
    'target',
  ],
};
