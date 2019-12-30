const config = require('../../stryker.parent');
delete config.tsconfigFile;
config.dashboard.module = 'elements';
config.plugins = [
  '@stryker-mutator/*',
  require.resolve('./tsconfig-transpiler')
];
config.dashboard.module = 'elements';
config.transpilers = ['tsconfig'];
config.testRunner = 'karma';
config.karma = {
  projectType: 'custom',
  configFile: 'karma.conf.js',
  config: {
    browsers: ['ChromeHeadless']
  }
};
config.timeoutMs = 2000;
config.coverageAnalysis = 'off';
module.exports = config;
