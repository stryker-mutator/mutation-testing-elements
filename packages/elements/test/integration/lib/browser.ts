import { Builder, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

let browser: WebDriver | null = null;

export function isHeadless(): boolean {
  return !!(process.env.HEADLESS ?? process.env.CI);
}

export async function init() {
  const baseOptions = new chrome.Options().windowSize({ width: 1400, height: 1000 });
  const chromeOptions = isHeadless() ? baseOptions.headless() : baseOptions;
  browser = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
}

export function getCurrent(): WebDriver {
  if (!browser) {
    throw new Error('Browser is not yet initialized');
  }
  return browser;
}
