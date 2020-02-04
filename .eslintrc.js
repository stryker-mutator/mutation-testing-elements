module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'prettier'
  ],
  parserOptions: {
    project: require.resolve('./tsconfig.lint.json')
  },
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'prettier/prettier': [
      'error'
    ]
  },
  'extends': [
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ]
}