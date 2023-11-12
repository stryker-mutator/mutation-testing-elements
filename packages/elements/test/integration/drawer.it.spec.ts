import type { MutantDot } from './po/MutantDot.po.js';
import type { Drawer } from './po/Drawer.po.js';
import { ReportPage } from './po/ReportPage.js';
import { actScreenshotMatch } from './lib/helpers.js';
import type { TestDot } from './po/TestDot.po.js';
import { test, expect } from '@playwright/test';

test.describe('Drawer', () => {
  let page: ReportPage;

  test.describe('mutant view', () => {
    test.beforeEach(async ({ page: p }) => {
      page = new ReportPage(p);
      await page.navigateTo('test-files-example/#mutant/deep-merge.ts');
    });

    test.describe('when a mutant is opened', () => {
      let drawer: Drawer;
      let mutant: MutantDot;
      test.beforeEach(async () => {
        mutant = page.mutantView.mutantDot(20);
        await mutant.toggle();
        drawer = page.mutantView.mutantDrawer();
        await page.mutantView.scrollToCode();
      });

      test('should show a summary in the drawer when a mutant is clicked', async () => {
        await drawer.whenHalfOpen();
        await expect(drawer.header).toHaveText('👽 ConditionalExpression Survived (15:41)');
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

      test('should show the statusReason', async ({ page: p }, testInfo) => {
        // Mutant 17 has a statusReason
        await page.mutantView.mutantDot(17).toggle();
        await drawer.whenHalfOpen();
        await expect(drawer.summary()).toContainText('Survived despite covered by 3 tests');
        await actScreenshotMatch(p, testInfo);
      });

      test('should close the drawer when deselecting the mutant', async () => {
        await mutant.toggle();
        await drawer.whenClosed();
      });

      test('should show the details of the next mutant when another mutant is selected', async () => {
        await page.mutantView.mutantDot(24).toggle();
        await drawer.whenHalfOpen();
        await expect(drawer.header).toHaveText('👽 ConditionalExpression Survived (15:77)');
      });

      test('should hide the drawer when the user clicks somewhere else', async () => {
        await page.mutantView.clickOnCode();
        await drawer.whenClosed();
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
  });

  test.describe('test view', () => {
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
});
