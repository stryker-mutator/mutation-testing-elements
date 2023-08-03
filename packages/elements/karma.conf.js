const webpack = require('./webpack.dev');
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'webpack'],
    files: ['test/unit/**/*.spec.ts'],
    preprocessors: {
      'test/unit/**/*.spec.ts': ['webpack', 'sourcemap'],
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    customLaunchers: {
      ChromeHeadlessDebug: {
        base: 'ChromeHeadless',
        flags: ['--remote-debugging-port=9333'],
      },
    },
    client: {
      mocha: {
        timeout: 20000, // windows can be slow in the pipeline
      },
    },
    browsers: process.env.CI || process.env.HEADLESS ? ['ChromeHeadless'] : ['Chrome'],
    concurrency: Infinity,
    webpack,
  });

  // Delete regular entry/output. Karma's `files` will be used
  delete config.webpack.entry;
  delete config.webpack.output;
};
