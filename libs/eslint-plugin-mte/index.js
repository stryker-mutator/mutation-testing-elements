import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import globals from 'globals';

/**
 * @type {import('eslint').Linter.FlatConfig[]}
 */
export default [
  eslint.configs.recommended,
  tseslint.configs.eslintRecommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './{src,test}/tsconfig.json', './test/{unit,integration}/tsconfig.json', '../../tsconfig.node.json'],
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
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
  },
  {
    files: ['*.js', '*.config.{js,ts}'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ['*.js', '*.config.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ignores: [
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
  },
];
