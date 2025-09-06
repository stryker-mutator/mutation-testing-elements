import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.eslintRecommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  eslintConfigPrettier,
  // @ts-expect-error - incorrect type
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './{src,test}/tsconfig.json', './test/{unit,integration}/tsconfig.json', '../../tsconfig.node.json'],
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',

      'import-x/newline-after-import': 'error',
      'import-x/no-deprecated': 'error',

      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',

      eqeqeq: 'error',
    },
  },
  {
    // Test-specific rules
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
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
      'playwright-report',
    ],
  },
);
