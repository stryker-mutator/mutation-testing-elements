module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    project: ['./tsconfig.json', './{src,test}/tsconfig.json', './test/{unit,integration}/tsconfig.json', '../../tsconfig.node.json'],
  },
  rules: {
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/consistent-type-imports': 'error',

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
  reportUnusedDisableDirectives: true,
  env: {
    node: true,
    es6: true,
  },
  ignorePatterns: [
    'trace/',
    'tsconfig-transpiler.js',
    'node_modules',
    'dist',
    'dist-tsc',
    'src-generated',
    '.stryker-tmp',
    'reports',
    'testResources',
    'target',
  ],
};
