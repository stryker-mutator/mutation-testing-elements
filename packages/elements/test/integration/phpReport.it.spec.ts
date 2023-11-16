import { expect, test } from '@playwright/test';
import { ReportPage } from './po/ReportPage.js';

test.describe('File report "infection-php-example/TextFileLogger.php"', () => {
  let page: ReportPage;

  test.beforeEach(async ({ page: p }) => {
    page = new ReportPage(p);
    await page.navigateTo('infection-php-example/#mutant/TextFileLogger.php');
  });

  test('should highlight the code', async () => {
    await page.mutantView.whenCodeIsHighlighted();
  });

  test('should show mutants', async () => {
    await page.mutantView.whenCodeIsHighlighted();
    await expect(page.mutantView.mutantDot('ebf143eb565188ddd7959bfbe70f631f').dot).toBeVisible();
  });
});
