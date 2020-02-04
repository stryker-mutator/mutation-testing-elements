import { ReportPage } from './po/ReportPage';
import { expect } from 'chai';
import { getCurrent } from './lib/browser';

describe('Navigation', () => {
  let page: ReportPage;

  const itShouldShowAllFilesPage = () => {
    it('should show "all files"', async () => {
      expect(await page.title()).eq('All files - Stryker report');
    });
  };

  beforeEach(() => {
    page = new ReportPage(getCurrent());
  });

  describe('when starting at the index page', () => {
    beforeEach(() => {
      return page.navigateTo('scala-example');
    });

    itShouldShowAllFilesPage();

    describe('-> "config"', () => {
      beforeEach(async () => {
        await page
          .resultTable()
          .row('config')
          .navigate();
      });

      it('should show "config" page', async () => {
        const title = await page.title();
        expect(title).eq('config - Stryker report');
      });

      it('should show breadcrumb "All files - config"', async () => {
        expect(await page.breadcrumb().items()).deep.equal(['All files', 'config']);
      });

      it('should show "Config.Scala" after navigating to Config.scala', async () => {
        await page
          .resultTable()
          .row('Config.scala')
          .navigate();
        expect(await page.breadcrumb().items()).deep.equal(['All files', 'config', 'Config.scala']);
      });

      describe('when navigating to "All files" using the breadcrumb', () => {
        beforeEach(() => {
          return page.breadcrumb().navigate('All files');
        });

        itShouldShowAllFilesPage();
      });
    });
  });
});
