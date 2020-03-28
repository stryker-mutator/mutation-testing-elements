const webpack = require('./webpack.dev');
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    files: ['test/unit/index.js'],
    preprocessors: {
      'test/unit/index.js': ['webpack', 'sourcemap'],
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: process.env.GITHUB_ACTIONS || process.env.TRAVIS ? ['ChromeHeadless'] : ['Chrome'],
    singleRun: process.env.GITHUB_ACTIONS || process.env.TRAVIS ? true : false,
    concurrency: Infinity,
    webpack,
  });

  // Delete regular entry/output. Karma's `files` will be used
  delete config.webpack.entry;
  delete config.webpack.output;
};
