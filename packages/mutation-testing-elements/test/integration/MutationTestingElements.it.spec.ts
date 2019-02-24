import { Builder, WebDriver, By, Capabilities } from 'selenium-webdriver';
import { StaticFileServer } from './StaticFileServer.spec';
import path from 'path';
import { expect } from 'chai';

describe('MutationTestingElements - reporting integration', () => {
  const server = new StaticFileServer([path.resolve(__dirname, '..', '..', '..', 'testResources'), path.resolve(__dirname, '..', '..', '..', 'dist')]);
  let browser: WebDriver;

  before(async () => {
    await server.listen(8080);
    const headlessCapabilities = Capabilities.chrome();
    headlessCapabilities.set('chromeOptions', { args: ['--headless'] });
    browser = await new Builder()
      .forBrowser('chrome')
      .withCapabilities(headlessCapabilities)
      .build();
  });

  after(async () => {
    await browser.close();
    await server.dispose();
  });

  beforeEach(async () => {
    await browser.get('http://localhost:8080');
  });

  describe('Scala example', () => {
    beforeEach(async () => {
      const anchor = await (browser.findElement(By.css('a[href="/scala-example"]')));
      await anchor.click();
    });
    it('should have title "All files"', async () => {
      const title = await browser.getTitle();
      expect(title).eq('All files');
    });
  });
});
