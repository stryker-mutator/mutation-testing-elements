/// <reference types="../typings/globals-chai" />
import { expect } from 'chai';
import { Context } from 'mocha';
import { WebElement, WebElementPromise } from 'selenium-webdriver';
import { ReportPage } from '../po/ReportPage';
import { getCurrent, isHeadless } from './browser';

export function selectShadowRoot(element: WebElement): WebElementPromise {
  return wrapInWebElementPromise(async () => {
    const shadowRoot = await getCurrent().executeScript<WebElement | undefined>('return arguments[0].shadowRoot', element);
    if (shadowRoot) {
      return shadowRoot;
    } else {
      if (element.getTagName) {
        const tagName = await element.getTagName().catch(() => 'unknown-tag');
        throw new Error(`Tag ${tagName} does not have a shadow root`);
      } else {
        throw new Error('No shadow root');
      }
    }
  });
}

export function wrapInWebElementPromise(p: () => Promise<WebElement>) {
  return new WebElementPromise(getCurrent(), p());
}

export async function isElementVisible(element: WebElementPromise) {
  try {
    const isDisplayed = await element.isDisplayed();
    return isDisplayed;
  } catch (err) {
    if (err instanceof Error && err.message.includes('no such element')) {
      return false;
    }
    throw err;
  }
}

export function sleep(n = 300) {
  return new Promise((res) => setTimeout(res, n));
}

export function itShouldMatchScreenshot(title: string) {
  it(title, async function () {
    await actScreenshotMatch(this);
  });
}

export async function actScreenshotMatch(context: Context) {
  if (isHeadless()) {
    const page = new ReportPage(getCurrent());
    await sleep();
    await expect(await page.takeScreenshot()).to.matchScreenshot();
  } else {
    console.log('[SKIP] skipping screenshot comparison, because not running in headless mode');
    context.skip();
  }
}
