module.exports = {
  require: [
    'ts-node/register',
    'chromedriver',
    './test/integration/setup/setup-browser.ts',
    './test/integration/setup/setup-chai.ts',
    './test/integration/setup/setup-server.ts',
  ],
  forbidOnly: Boolean(process.env.CI),
  timeout: 60000,
  spec: ['test/integration/**/*.it.spec.ts'],
};
