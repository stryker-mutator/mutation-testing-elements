import { expect, test } from '@playwright/test';

import { actScreenshotMatch } from './lib/helpers.js';
import type { Drawer } from './po/Drawer.po.js';
import { ReportPage } from './po/ReportPage.js';
import type { TestDot } from './po/TestDot.po.js';

test.describe('Drawer test view', () => {
  let page: ReportPage;
  let drawer: Drawer;
  let dot: TestDot;

  test.beforeEach(async ({ page: p }) => {
    page = new ReportPage(p);
    await page.navigateTo('lighthouse-example/#test/metrics/interactive-test.js');
    dot = page.testView.testDot(597);
    await dot.toggle();
    drawer = page.testView.testDrawer;
    await page.testView.scrollToCode();
  });

  test('should show a summary in the drawer when a test is selected', async () => {
    await drawer.whenHalfOpen();
    await expect(drawer.header).toHaveText('✅ Performance: interactive audit should compute interactive [Killing] (22:4)');
  });

  test('should look as expected', async ({ page: p }, testInfo) => {
    await drawer.whenHalfOpen();
    await actScreenshotMatch(p, testInfo);
  });

  test('should look as expected in dark mode', async ({ page: p }, testInfo) => {
    await page.themeSelector.select('dark');
    await drawer.whenHalfOpen();
    await actScreenshotMatch(p, testInfo);
  });

  test('should hide the drawer when the user clicks somewhere else', async () => {
    await page.testView.clickOnCode();
    await drawer.whenClosed();
    await expect(drawer.details()).not.toBeVisible();
  });

  test('should not hide the drawer when the user clicks somewhere on the drawer', async () => {
    await drawer.whenHalfOpen();
    await drawer.clickOnHeader();

    await drawer.whenHalfOpen();
  });

  test.describe('when "read more" is toggled', () => {
    test.beforeEach(async () => {
      await drawer.whenHalfOpen();
      await drawer.toggleReadMore();
      await drawer.whenOpen();
    });

    test('should show the details', async () => {
      await expect(drawer.details()).toBeVisible();
    });

    test('should look as expected', async ({ page: p }, testInfo) => {
      await actScreenshotMatch(p, testInfo);
    });

    test('should look as expected in dark mode', async ({ page: p }, testInfo) => {
      await page.themeSelector.select('dark');
      await actScreenshotMatch(p, testInfo);
    });
  });
});
