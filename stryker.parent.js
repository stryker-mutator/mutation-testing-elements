process.env.STRYKER_DASHBOARD_API_KEY = '18f5251d-c314-4f4a-9211-bcaf66e3c077';

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
    spec: ['test/unit/**/*.js']
  },
  maxConcurrentTestRunners: 2,
  dashboard: {
    project: 'github.com/stryker-mutator/mutation-testing-elements',
    version: 'master',
    reportType: 'full'
  }
};
