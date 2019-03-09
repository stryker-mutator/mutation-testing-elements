import { ReportPage } from './po/ReportPage';
import { expect } from 'chai';

describe('Navigation', () => {

  let page: ReportPage;

  const itShouldShowAllFilesPage = () => {
    it('should show "all files"', async () => {
      expect(await page.title()).eq('All files - Stryker report');
    });
  };

  beforeEach(() => {
    page = new ReportPage();
  });

  describe('when starting at the index page', () => {
    beforeEach(() => {
      return page.navigateTo('scala-example');
    });

    itShouldShowAllFilesPage();

    describe('-> "config"', () => {

      beforeEach(async () => {
        const table = await page.resultTable();
        const config = await table.row('config');
        await config.navigate();
      });

      it('should show "config" page', async () => {
        const title = await page.title();
        expect(title).eq('config - Stryker report');
      });

      it('should show breadcrumb "All files - config"', async () => {
        expect(await (await page.breadcrumb()).items()).deep.equal(['All files', 'config']);
      });

      it('should show "Config.Scala" after navigating to Config.scala', async () => {
        const resultTable = await page.resultTable();
        const configScala = await resultTable.row('Config.scala');
        await configScala.navigate();
        expect(await (await page.breadcrumb()).items()).deep.equal(['All files', 'config', 'Config.scala']);
      });

      describe('when navigating to "All files" using the breadcrumb', () => {
        beforeEach(async () => {
          return (await page.breadcrumb()).navigate('All files');
        });

        itShouldShowAllFilesPage();
      });
    });
  });
});
