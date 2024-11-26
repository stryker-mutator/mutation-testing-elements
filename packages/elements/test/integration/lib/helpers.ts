import type { Page, TestInfo } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { isHeadless } from './browser.js';

export function itShouldMatchScreenshot(title: string) {
  test(title, async function ({ page }, context) {
    await actScreenshotMatch(page, context);
  });
}

export async function actScreenshotMatch(page: Page, context: TestInfo) {
  if (isHeadless()) {
    await page.locator('mutation-test-report-app >> :is(mte-test-view, mte-mutant-view)').waitFor();
    await expect(page).toHaveScreenshot();
  } else {
    console.log('[SKIP] skipping screenshot comparison, because not running in headless mode');
    context.skip();
  }
}

/**
 * Waits until the given predicate returns a truthy value. Calls and awaits the predicate
 * function at the given interval time. Can be used to poll until a certain condition is true.
 *
 * @example
 * ```js
 * import { waitUntil } from './lib/helpers.js';
 *
 * await waitUntil(async () => expect(await drawer.isHalfOpen()).true);
 * ```
 *
 * @param predicate - predicate function which is called each poll interval.
 *   The predicate is awaited, so it can return a promise.
 * @param message an optional message to display when the condition timed out
 * @param options timeout and polling interval
 */
export function waitUntil(
  predicate: () => Promise<void>,
  message?: string,
  { interval, timeout }: { interval?: number; timeout?: number } = {},
): Promise<void> {
  return expect(predicate, message).toPass({ intervals: interval ? [interval] : undefined, timeout });
}
