import { expect } from 'chai';
import { TestStatus } from 'mutation-testing-metrics';
import { getCurrent } from './lib/browser';
import { itShouldMatchScreenshot, waitUntil } from './lib/helpers';
import { ReportPage } from './po/ReportPage';
import { TestListItem } from './po/TestListItem.po';

describe('Test view', () => {
  let page: ReportPage;

  beforeEach(() => {
    page = new ReportPage(getCurrent());
  });

  describe('test file with code and test locations', () => {
    beforeEach(async () => {
      await page.navigateTo('lighthouse-example/#test/metrics/interactive-test.js');
    });

    it('should show 2 tests', async () => {
      const tests = await page.testView.testDots();
      expect(tests).lengthOf(2);
      expect(await tests[0].isVisible()).true;
      expect(await tests[1].isVisible()).true;
    });

    it('should show test filters', async () => {
      const states = await page.testView.stateFilter.states();
      const labels = await Promise.all(states.map((state) => state.text()));
      expect(labels).deep.eq(['✅ Killing (1)', '☂ Covering (1)']);
    });

    it('should hide tests that are filtered out', async () => {
      await page.testView.stateFilter.state(TestStatus.Covering).click();
      const testDots = await page.testView.testDots();
      expect(testDots).lengthOf(1);
      expect(await testDots[0].getStatus()).eq(TestStatus.Killing);
    });

    it('should show the drawer when selecting a test', async () => {
      await page.testView.testDot(597).toggle();
      await page.testView.testDrawer.whenHalfOpen();
    });

    describe('when navigating "previous test"', () => {
      beforeEach(async () => {
        await page.testView.stateFilter.previous();
      });

      // next and previous test already unit tested, so only focus on the part that wasn't unit tested

      it('should scroll and focus the last test when "previous" is called', async () => {
        await waitUntil(async () => {
          const posAfter = await page.pageYOffset();
          return expect(posAfter).gt(100);
        });
        expect(await (await page.testView.testDots()).slice(-1)[0].isActive()).true;
      });

      itShouldMatchScreenshot('should look as expected');
    });
  });

  describe('test file without code', () => {
    beforeEach(async () => {
      await page.navigateTo('test-files-example/#test/stryker-error.unit.ts');
    });

    it('should tests in a list box', async () => {
      const testDots = await page.testView.testDots();
      const testListItems = await page.testView.testListItems();
      expect(testDots).lengthOf(0);
      expect(testListItems).lengthOf(3);
    });

    it('should show test filters', async () => {
      const states = await page.testView.stateFilter.states();
      const labels = await Promise.all(states.map((state) => state.text()));
      expect(labels).deep.eq(['✅ Killing (2)', '☂ Covering (1)']);
    });

    describe('when selecting a test', () => {
      let testListItems: TestListItem[];

      beforeEach(async () => {
        testListItems = await page.testView.testListItems();
        await testListItems[0].toggle();
      });

      it('should show the test as active', async () => {
        expect(await testListItems[0].isSelected()).true;
      });

      it('should show the drawer', async () => {
        await page.testView.testDrawer.whenHalfOpen();
      });

      it('should be able to deselect', async () => {
        await testListItems[0].toggle();
        expect(await testListItems[0].isSelected()).false;
      });

      it('should deselect when selecting another test', async () => {
        await testListItems[1].toggle();
        expect(await testListItems[0].isSelected()).false;
        expect(await testListItems[1].isSelected()).true;
      });
    });
  });

  describe('test report without files', () => {
    beforeEach(async () => {
      await page.navigateTo('tests-example/#test');
    });

    it('should simply list all tests in a list box', async () => {
      const testDots = await page.testView.testDots();
      const testListItems = await page.testView.testListItems();
      expect(testDots).lengthOf(0);
      expect(testListItems).lengthOf(82);
    });
  });
});
