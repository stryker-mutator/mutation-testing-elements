/// <reference types="../typings/globals-chai" />
import { expect, AssertionError } from 'chai';
import { Context } from 'mocha';
import { from } from 'rxjs';
import { mergeMap, toArray } from 'rxjs/operators';
import { WebElement, WebElementPromise, error } from 'selenium-webdriver';
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

export async function isElementVisible(element: WebElementPromise | WebElement) {
  try {
    const isDisplayed = await element.isDisplayed();
    return isDisplayed;
  } catch (err) {
    if (err instanceof Error && err.message.includes('no such element')) {
      return false;
    }
    if (err instanceof error.StaleElementReferenceError) {
      return false;
    }
    throw err;
  }
}

export function sleep(n = 1000) {
  return new Promise((res) => setTimeout(res, n));
}

export function itShouldMatchScreenshot(title: string, sleepMs = 1000) {
  it(title, async function () {
    await actScreenshotMatch(this, sleepMs);
  });
}

export async function actScreenshotMatch(context: Context, sleepMs = 1000) {
  if (isHeadless()) {
    const page = new ReportPage(getCurrent());
    await sleep(sleepMs);
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
      toArray(),
    )
    .toPromise() as Promise<T[]>;
}

/**
 * Waits until the given predicate returns a truthy value. Calls and awaits the predicate
 * function at the given interval time. Can be used to poll until a certain condition is true.
 *
 * @example
 * ```js
 * import { waitUntil } from './lib/helpers';
 *
 * await waitUntil(async () => expect(await drawer.isHalfOpen()).true);
 * ```
 *
 * @param predicate - predicate function which is called each poll interval.
 *   The predicate is awaited, so it can return a promise.
 * @param message an optional message to display when the condition timed out
 * @param options timeout and polling interval
 *
 * @link Based on https://github.com/open-wc/open-wc/blob/5a28b1a546503f7677bd87c030c735bdb1ca30d7/packages/testing-helpers/src/helpers.js#L135-L179
 */
export function waitUntil(
  predicate: () => Promise<boolean | Chai.Assertion>,
  message?: string,
  options: { interval?: number; timeout?: number } = {},
): Promise<void> {
  // Default options
  const { interval, timeout } = { interval: 100, timeout: 2500, ...options };

  return new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout;
    let lastError: Error | undefined;

    setTimeout(() => {
      clearTimeout(timeoutId);
      reject(lastError ? lastError : new Error(message ? `Timeout: ${message}` : `waitUntil timed out after ${timeout}ms`));
    }, timeout);

    async function nextInterval() {
      try {
        if (await predicate()) {
          resolve();
        } else {
          timeoutId = setTimeout(() => void nextInterval(), interval);
        }
      } catch (error) {
        if (error instanceof Error) {
          lastError = error;
        }
        if (error instanceof AssertionError) {
          timeoutId = setTimeout(() => void nextInterval(), interval);
        } else {
          reject(error);
        }
      }
    }
    void nextInterval();
  });
}
