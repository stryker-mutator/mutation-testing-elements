const webpack = require('./webpack.config');
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    files: [
      'test/unit/**/*.ts'
    ],
    preprocessors: {
      'test/unit/**/*.ts': ['webpack'],
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: process.env.TRAVIS ? ['ChromeHeadless'] : ['Chrome'],
    singleRun: process.env.TRAVIS ? true : false,
    concurrency: Infinity,
    webpack
  });

  // Delete regular entry. Karma's `files` will be used
  delete config.webpack.entry;
}

