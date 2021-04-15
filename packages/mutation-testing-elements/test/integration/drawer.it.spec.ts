import { expect } from 'chai';
import { getCurrent } from './lib/browser';
import { sleep } from './lib/helpers';
import { MutantComponent } from './po/MutantComponent.po';
import { Drawer } from './po/Drawer.po';
import { ReportPage } from './po/ReportPage';
import { actScreenshotMatch } from './lib/helpers';
import { TestComponent } from './po/TestComponent.po';

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
      let mutant: MutantComponent;
      beforeEach(async () => {
        mutant = page.mutantView.mutant(20);
        await mutant.toggleMutant();
        drawer = page.mutantView.mutantDrawer();
        await page.mutantView.scrollToCode();
      });

      it('should show a summary in the drawer when a mutant is clicked', async () => {
        await drawer.whenHalfOpen();
        expect(await drawer.headerText()).eq('20 👽 ConditionalExpression Survived (15:41)');
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

      it('should close the drawer when deselecting the mutant', async () => {
        await mutant.toggleMutant();
        await drawer.whenClosed();
      });

      it('should show the details of the next mutant when another mutant is selected', async () => {
        await page.mutantView.mutant(24).toggleMutant();
        await sleep();
        expect(await drawer.isHalfOpen()).true;
        expect(await drawer.headerText()).eq('24 👽 ConditionalExpression Survived (15:77)');
      });

      it('should hide the drawer when the user clicks somewhere else', async () => {
        await page.mutantView.clickOnCode();
        await drawer.whenClosed();
      });

      it('should not hide the drawer when the user clicks somewhere on the drawer', async () => {
        await drawer.whenHalfOpen();
        await drawer.clickOnHeader();
        await sleep();
        expect(await drawer.isHalfOpen()).true;
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

        it('should look as expected in dark mode', async function () {
          await page.themeSelector.select('dark');
          await actScreenshotMatch(this);
        });
      });
    });
  });

  describe('test view', () => {
    let drawer: Drawer;
    let test: TestComponent;

    beforeEach(async () => {
      page = new ReportPage(getCurrent());
      await page.navigateTo('lighthouse-example/#test/metrics/interactive-test.js');
      await page.whenFileReportLoaded();
      test = page.testView.test(597);
      await test.toggle();
      drawer = page.testView.testDrawer;
      await page.testView.scrollToCode();
    });

    it('should show a summary in the drawer when a test is selected', async () => {
      await drawer.whenHalfOpen();
      expect(await drawer.headerText()).eq('597 ✅ Performance: interactive audit should compute interactive [Killing] (22:4)');
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
      await sleep();
      expect(await drawer.isHalfOpen()).true;
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

      it('should look as expected in dark mode', async function () {
        await page.themeSelector.select('dark');
        await actScreenshotMatch(this);
      });
    });
  });
});
