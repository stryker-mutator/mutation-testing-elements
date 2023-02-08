import { ReportPage } from './po/ReportPage';
import { expect } from 'chai';
import { getCurrent } from './lib/browser';
import { NavTab } from './po/NavTab.po';

describe('Navigation', () => {
  let page: ReportPage;

  beforeEach(() => {
    page = new ReportPage(getCurrent());
  });

  describe('when starting at the index page', () => {
    beforeEach(() => {
      return page.navigateTo('scala-example');
    });
    it('should show "all files"', async () => {
      expect(await page.title()).eq('All files - Stryker report');
    });
    it("shouldn't show the navigation tabs if there are no test details", async () => {
      const tabs = await page.navigationTabs();
      expect(tabs).lengthOf(0);
    });

    describe('-> "config"', () => {
      beforeEach(async () => {
        await page.mutantView.resultTable().row('config').navigate();
      });

      it('should show "config" page', async () => {
        const title = await page.title();
        expect(title).eq('config - Stryker report');
      });

      it('should show breadcrumb "All files - config"', async () => {
        expect(await page.breadcrumb().items()).deep.equal(['All files', 'config']);
      });

      it('should show "Config.Scala" after navigating to Config.scala', async () => {
        await page.mutantView.resultTable().row('Config.scala').navigate();
        expect(await page.breadcrumb().items()).deep.equal(['All files', 'config', 'Config.scala']);
      });

      describe('when navigating to "All files" using the breadcrumb', () => {
        beforeEach(() => {
          return page.breadcrumb().navigate('All files');
        });

        it('should show "all files"', async () => {
          expect(await page.title()).eq('All files - Stryker report');
        });
      });
    });
  });

  describe('when opening a report with test details', () => {
    let tabs: NavTab[];

    beforeEach(async () => {
      await page.navigateTo('lighthouse-example');
      tabs = await page.navigationTabs();
    });

    it('should show the navigation tabs', async () => {
      const labels = await Promise.all(tabs.map((tab) => tab.text()));
      expect(tabs).lengthOf(2);
      expect(labels).deep.eq(['👽 Mutants', '🧪 Tests']);
    });

    it('should show the mutant view by default', async () => {
      expect(await page.title()).eq('All files');
      expect(await page.currentUrl()).contains('#mutant');
      expect(await tabs[0].isActive()).true;
      expect(await tabs[1].isActive()).false;
    });

    describe('open tests', () => {
      beforeEach(async () => {
        await tabs[1].navigate();
      });

      it('should show the tests view', async () => {
        expect(await page.title()).eq('All tests');
        expect(await page.currentUrl()).contains('#test');
        expect(await tabs[0].isActive()).false;
        expect(await tabs[1].isActive()).true;
      });

      describe('-> metrics', () => {
        beforeEach(async () => {
          await page.testView.resultTable().row('metrics').navigate();
        });

        it('should show "metrics" page', async () => {
          const title = await page.title();
          expect(title).eq('metrics');
        });

        it('should show breadcrumb "All tests - metrics"', async () => {
          expect(await page.breadcrumb().items()).deep.equal(['All tests', 'metrics']);
        });

        it('should show "interactive-test.js" after navigating to interactive-test.js', async () => {
          await page.testView.resultTable().row('interactive-test.js').navigate();
          expect(await page.breadcrumb().items()).deep.equal(['All tests', 'metrics', 'interactive-test.js']);
        });

        describe('when navigating to "All tests" using the breadcrumb', () => {
          beforeEach(() => {
            return page.breadcrumb().navigate('All tests');
          });

          it('should show "all tests"', async () => {
            expect(await page.title()).eq('All tests');
          });
        });
      });
    });
  });
});
