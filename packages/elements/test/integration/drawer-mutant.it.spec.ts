import { expect, test } from '@playwright/test';

import { actScreenshotMatch } from './lib/helpers.js';
import type { Drawer } from './po/Drawer.po.js';
import type { MutantDot } from './po/MutantDot.po.js';
import { ReportPage } from './po/ReportPage.js';

test.describe('Drawer mutant view', () => {
  let page: ReportPage;

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
