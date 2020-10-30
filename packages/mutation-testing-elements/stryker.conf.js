const config = require('../../stryker.parent');
config.dashboard = { module: 'elements' };
config.testRunner = 'karma';
config.karma = {
  projectType: 'custom',
  configFile: 'karma.conf.js',
  config: {
    browsers: ['ChromeHeadless'],
  },
};
module.exports = config;
