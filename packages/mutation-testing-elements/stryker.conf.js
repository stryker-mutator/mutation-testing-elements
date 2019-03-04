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
    tsconfigFile: 'tsconfig.json',
    mutate: [
      'src/**/*.ts',
      '!src/**/*.d.ts'
    ],
    maxConcurrentTestRunners: 2
  });
};
