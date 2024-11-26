import { expect, test } from '@playwright/test';

import { ReportPage } from './po/ReportPage.js';

test.describe('FilePicker', () => {
  let page: ReportPage;

  test.beforeEach(async ({ page: p }) => {
    page = new ReportPage(p);
    await page.navigateTo('test-files-example/#mutant/deep-merge.ts');
  });

  test('clicking search should open the file picker', async () => {
    const filePicker = await page.breadcrumb().openFilePicker();
    await expect(filePicker.picker()).toBeVisible();
  });

  test('pressing enter should open the file and close the file picker', async ({ page: p }) => {
    const filePicker = await page.breadcrumb().openFilePicker();

    await p.keyboard.press('Enter');
    await page.mutantView.waitForVisible();
    await expect(filePicker.picker()).not.toBeVisible();
  });
});
