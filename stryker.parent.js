/**
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */
module.exports = {
  mutator: 'typescript',
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress', 'dashboard'],
  testRunner: 'mocha',
  transpilers: ['typescript'],
  testFramework: 'mocha',
  coverageAnalysis: 'perTest',
  tsconfigFile: 'tsconfig.stryker.json',
  mutate: ['src/**/*.ts'],
  mochaOptions: {
    spec: ['test/unit/**/*.js'],
  },
  maxConcurrentTestRunners: 2,
  dashboard: {
    reportType: 'full',
  },
};
