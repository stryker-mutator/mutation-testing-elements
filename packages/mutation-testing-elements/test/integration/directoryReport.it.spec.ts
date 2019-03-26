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
      expect(await page.resultTable().rows()).lengthOf(11);
    });

    it('should show "all files" with "77.83%" mutation score', async () => {
      expect(await page.resultTable().row('All files').progressBar().percentageText()).eq('77.83%');
    });

    it('should show expected totals for cli.ts', async () => {
      const cliRow = await page.resultTable().row('cli.ts');
      return Promise.all([
        expect(await cliRow.progressBar().percentageText()).eq('8.70%'),
        expect(await cliRow.mutationScore()).eq('8.70'),
        expect(await cliRow.killed()).eq('2'),
        expect(await cliRow.survived()).eq('1'),
        expect(await cliRow.timeout()).eq('0'),
        expect(await cliRow.noCoverage()).eq('20'),
        expect(await cliRow.runtimeErrors()).eq('0'),
        expect(await cliRow.compileErrors()).eq('3'),
        expect(await cliRow.totalDetected()).eq('2'),
        expect(await cliRow.totalUndetected()).eq('21'),
        expect(await cliRow.totalMutants()).eq('26')]);
    });
  });
});
