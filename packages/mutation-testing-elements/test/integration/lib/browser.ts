import { Builder, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

let browser: WebDriver | null = null;

export async function init() {
  const baseOptions = new chrome.Options();
  // Use headless chrome on the build server
  if (process.env.GITHUB_ACTIONS) {
    process.env.CHROME_DRIVER = process.env.ChromeWebDriver;
    console.log('Detecting Github actions, using chrome driver at');
  }
  console.log(`Using chrome driver at "${process.env.CHROME_DRIVER}"`);

  const chromeOptions = process.env.TRAVIS || process.env.GITHUB_ACTIONS ?
    baseOptions.headless() :
    baseOptions;

  browser = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();
}

export function getCurrent(): WebDriver {
  if (!browser) {
    throw new Error('Browser is not yet initialized');
  }
  return browser;
}
