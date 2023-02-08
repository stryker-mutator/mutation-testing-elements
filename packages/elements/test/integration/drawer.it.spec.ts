import { expect } from 'chai';
import { getCurrent } from './lib/browser';
import { waitUntil } from './lib/helpers';
import { MutantDot } from './po/MutantDot.po';
import { Drawer } from './po/Drawer.po';
import { ReportPage } from './po/ReportPage';
import { actScreenshotMatch } from './lib/helpers';
import { TestDot } from './po/TestDot.po';

describe('Drawer', () => {
  let page: ReportPage;

  describe('mutant view', () => {
    beforeEach(async () => {
      page = new ReportPage(getCurrent());
      await page.navigateTo('test-files-example/#mutant/deep-merge.ts');
      await page.whenFileReportLoaded();
    });

    describe('when a mutant is opened', () => {
      let drawer: Drawer;
      let mutant: MutantDot;
      beforeEach(async () => {
        mutant = page.mutantView.mutantDot(20);
        await mutant.toggle();
        drawer = page.mutantView.mutantDrawer();
        await page.mutantView.scrollToCode();
      });

      it('should show a summary in the drawer when a mutant is clicked', async () => {
        await drawer.whenHalfOpen();
        expect(await drawer.headerText()).eq('👽 ConditionalExpression Survived (15:41)');
      });

      it('should look as expected', async function () {
        await drawer.whenHalfOpen();
        await actScreenshotMatch(this);
      });

      it('should look as expected in dark mode', async function () {
        await page.themeSelector.select('dark');
        await drawer.whenHalfOpen();
        await actScreenshotMatch(this);
      });

      it('should show the statusReason', async function () {
        // Mutant 17 has a statusReason
        await page.mutantView.mutantDot(17).toggle();
        await drawer.whenHalfOpen();
        const summary = await drawer.summaryText();
        expect(summary).contains('Survived despite covered by 3 tests');
        await actScreenshotMatch(this);
      });

      it('should close the drawer when deselecting the mutant', async () => {
        await mutant.toggle();
        await drawer.whenClosed();
      });

      it('should show the details of the next mutant when another mutant is selected', async () => {
        await page.mutantView.mutantDot(24).toggle();
        await waitUntil(async () => {
          expect(await drawer.isHalfOpen()).true;
          return expect(await drawer.headerText()).eq('👽 ConditionalExpression Survived (15:77)');
        });
      });

      it('should hide the drawer when the user clicks somewhere else', async () => {
        await page.mutantView.clickOnCode();
        await drawer.whenClosed();
      });

      it('should not hide the drawer when the user clicks somewhere on the drawer', async () => {
        await drawer.whenHalfOpen();
        await drawer.clickOnHeader();

        await waitUntil(async () => expect(await drawer.isHalfOpen()).true);
      });

      describe('when "read more" is toggled', () => {
        beforeEach(async () => {
          await drawer.whenHalfOpen();
          await drawer.toggleReadMore();
          await drawer.whenOpen();
        });

        it('should show the details', async () => {
          expect(await drawer.detailsVisible()).true;
        });

        it('should look as expected', async function () {
          await actScreenshotMatch(this);
        });

        // Flaky test, disable until we find a good fix
        it.skip('should look as expected in dark mode', async function () {
          await page.themeSelector.select('dark');
          await actScreenshotMatch(this);
        });
      });
    });
  });

  describe('test view', () => {
    let drawer: Drawer;
    let test: TestDot;

    beforeEach(async () => {
      page = new ReportPage(getCurrent());
      await page.navigateTo('lighthouse-example/#test/metrics/interactive-test.js');
      await page.whenFileReportLoaded();
      test = page.testView.testDot(597);
      await test.toggle();
      drawer = page.testView.testDrawer;
      await page.testView.scrollToCode();
    });

    it('should show a summary in the drawer when a test is selected', async () => {
      await drawer.whenHalfOpen();
      expect(await drawer.headerText()).eq('✅ Performance: interactive audit should compute interactive [Killing] (22:4)');
    });

    it('should look as expected', async function () {
      await drawer.whenHalfOpen();
      await actScreenshotMatch(this);
    });

    it('should look as expected in dark mode', async function () {
      await page.themeSelector.select('dark');
      await drawer.whenHalfOpen();
      await actScreenshotMatch(this);
    });

    it('should hide the drawer when the user clicks somewhere else', async () => {
      await page.testView.clickOnCode();
      await drawer.whenClosed();
    });

    it('should not hide the drawer when the user clicks somewhere on the drawer', async () => {
      await drawer.whenHalfOpen();
      await drawer.clickOnHeader();

      await waitUntil(async () => expect(await drawer.isHalfOpen()).true);
    });

    describe('when "read more" is toggled', () => {
      beforeEach(async () => {
        await drawer.whenHalfOpen();
        await drawer.toggleReadMore();
        await drawer.whenOpen();
      });

      it('should show the details', async () => {
        expect(await drawer.detailsVisible()).true;
      });

      it('should look as expected', async function () {
        await actScreenshotMatch(this);
      });

      // Flaky test, disable until we find a good fix
      it.skip('should look as expected in dark mode', async function () {
        await page.themeSelector.select('dark');
        await actScreenshotMatch(this);
      });
    });
  });
});
