/// <reference types="../typings/globals-chai" />
import { expect } from 'chai';
import { Context } from 'mocha';
import { from } from 'rxjs';
import { mergeMap, toArray } from 'rxjs/operators';
import { WebElement, WebElementPromise } from 'selenium-webdriver';
import { ReportPage } from '../po/ReportPage';
import { getCurrent, isHeadless } from './browser';
import { MAX_WEBDRIVER_CONCURRENCY } from './constants';

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

export function sleep(n = 1000) {
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

/**
 * Maps the shadow root from a possibly big list of elements using the provided `fn`,
 * while limiting the number of concurrent operations, so web driver is still able to handle the load.
 */
export async function mapShadowRootConcurrent<T>(elements: Promise<WebElement[]>, fn: (el: WebElement) => T): Promise<T[]> {
  const element$ = from(await elements);
  return element$
    .pipe(
      mergeMap(async (host) => fn(await selectShadowRoot(host)), MAX_WEBDRIVER_CONCURRENCY),
      toArray()
    )
    .toPromise() as Promise<T[]>;
}
