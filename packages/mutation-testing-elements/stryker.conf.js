module.exports = function(config) {
  config.set({
    mutator: 'typescript',
    packageManager: 'npm',
    reporters: ['html', 'clear-text', 'progress'],
    testRunner: 'karma',
    transpilers: [],
    karma: {
      projectType: 'custom',
      configFile: 'karma.conf.js',
      config: {
        browsers: ['ChromeHeadless']
      }
    },
    transpilers: [
      'tsconfig'
    ],
    mutate: [
      'src/**/*.ts',
      '!src/**/*.d.ts'
    ],
    plugins: [
      '@stryker-mutator/*',
      require.resolve('./tsconfig-transpiler')
    ],
    maxConcurrentTestRunners: 2
  });
};
