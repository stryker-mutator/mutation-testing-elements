import { ReportPage } from './po/ReportPage';
import { expect } from 'chai';
import { getCurrent } from './lib/browser';

describe('Directory report page', () => {
  let page: ReportPage;
  beforeEach(async () => {
    page = new ReportPage(getCurrent());
    await page.navigateTo('install-local-example');
  });

  describe('the results table', () => {
    it('should show 11 rows in the result table', async () => {
      expect(await page.mutantView.resultTable().rows()).lengthOf(11);
    });

    it('should show "all files" with "78.57" mutation score', async () => {
      const row = page.mutantView.resultTable().row('All files');
      expect(await row.progressBar().percentageText()).eq('78.57');
      expect(await row.mutationScore()).eq('78.57');
    });

    it('should show expected totals for cli.ts', async () => {
      const row = page.mutantView.resultTable().row('cli.ts');
      return Promise.all([
        expect(await row.progressBar().percentageText()).eq('8.70'),
        expect(await row.mutationScore()).eq('8.70'),
        expect(await row.killed()).eq('2'),
        expect(await row.survived()).eq('1'),
        expect(await row.timeout()).eq('0'),
        expect(await row.noCoverage()).eq('20'),
        expect(await row.ignored()).eq('0'),
        expect(await row.runtimeErrors()).eq('0'),
        expect(await row.compileErrors()).eq('3'),
        expect(await row.totalDetected()).eq('2'),
        expect(await row.totalUndetected()).eq('21'),
        expect(await row.totalMutants()).eq('26'),
      ]);
    });
  });
});
