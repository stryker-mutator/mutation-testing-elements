import { expect, test } from '@playwright/test';

import { ReportPage } from './po/ReportPage.js';

test.describe('Directory report page', () => {
  let page: ReportPage;
  test.beforeEach(async ({ page: p }) => {
    page = new ReportPage(p);
    await page.navigateTo('install-local-example/');
  });

  test.describe('the results table', () => {
    test('should show 11 rows in the result table', async () => {
      expect(await page.mutantView.resultTable().rows()).toHaveLength(11);
    });

    test('should show "all files" with "78.57" mutation score', async () => {
      const row = page.mutantView.resultTable().row('All files');
      await row.progressBar().expectPercentage('78.57');
      await expect(row.mutationScore()).toHaveText('78.57');
    });

    test('should show expected totals for cli.ts', async () => {
      const row = page.mutantView.resultTable().row('cli.ts');
      await Promise.all([
        row.progressBar().expectPercentage('8.70'),
        expect(row.mutationScore()).toHaveText('8.70'),
        row.testStrengthProgressBar().expectPercentage('66.67'),
        expect(row.mutationScoreBasedOnCoveredCode()).toHaveText('66.67'),
        expect(row.killed()).toHaveText('2'),
        expect(row.survived()).toHaveText('1'),
        expect(row.timeout()).toHaveText('0'),
        expect(row.noCoverage()).toHaveText('20'),
        expect(row.ignored()).toHaveText('0'),
        expect(row.runtimeErrors()).toHaveText('0'),
        expect(row.compileErrors()).toHaveText('3'),
        expect(row.totalDetected()).toHaveText('2'),
        expect(row.totalUndetected()).toHaveText('21'),
        expect(row.totalMutants()).toHaveText('26'),
      ]);
    });
  });
});
