import { expect } from 'chai';
import { TestStatus } from 'mutation-testing-metrics';
import { test, expect as expectPW } from '@playwright/test';
import { itShouldMatchScreenshot, waitUntil } from './lib/helpers.js';
import { ReportPage } from './po/ReportPage.js';
import type { TestListItem } from './po/TestListItem.po.js';

test.describe('Test view', () => {
  let page: ReportPage;

  test.beforeEach(({ page: p }) => {
    page = new ReportPage(p);
  });

  test.describe('test file with code and test locations', () => {
    test.beforeEach(async () => {
      await page.navigateTo('lighthouse-example/#test/metrics/interactive-test.js');
    });

    test('should show 2 tests', async () => {
      const tests = await page.testView.testDots();
      expect(tests).lengthOf(2);
      await tests[0].waitForVisible();
      await tests[1].waitForVisible();
    });

    test('should show test filters', async () => {
      const states = page.testView.stateFilter.statesLocator;
      await expectPW(states).toHaveText(['✅ Killing (1)', '☂ Covering (1)']);
    });

    test('should hide tests that are filtered out', async () => {
      await page.testView.stateFilter.state(TestStatus.Covering).click();
      const testDots = await page.testView.testDots();
      expect(testDots).lengthOf(1);
      expect(await testDots[0].getStatus()).eq(TestStatus.Killing);
    });

    test('should show the drawer when selecting a test', async () => {
      await page.testView.testDot(597).toggle();
      await page.testView.testDrawer.whenHalfOpen();
    });

    test.describe('when navigating "previous test"', () => {
      test.beforeEach(async () => {
        await page.testView.stateFilter.previous();
        await waitUntil(async () => {
          const posAfter = await page.pageYOffset();
          return expect(posAfter).gt(100);
        });
      });

      // next and previous test already unit tested, so only focus on the part that wasn't unit tested

      test('should scroll and focus the last test when "previous" is called', async () => {
        const posAfter = await page.pageYOffset();
        expect(posAfter).gt(100);
        expect(await (await page.testView.testDots()).slice(-1)[0].isActive()).true;
      });

      itShouldMatchScreenshot('should look as expected');
    });
  });

  test.describe('test file without code', () => {
    test.beforeEach(async () => {
      await page.navigateTo('test-files-example/#test/stryker-error.unit.ts');
    });

    test('should tests in a list box', async () => {
      const testDots = await page.testView.testDots();
      const testListItems = await page.testView.testListItems();
      expect(testDots).lengthOf(0);
      expect(testListItems).lengthOf(3);
    });

    test('should show test filters', async () => {
      const states = page.testView.stateFilter.statesLocator;
      await expectPW(states).toHaveText(['✅ Killing (2)', '☂ Covering (1)']);
    });

    test.describe('when selecting a test', () => {
      let testListItems: TestListItem[];

      test.beforeEach(async () => {
        testListItems = await page.testView.testListItems();
        await testListItems[0].toggle();
      });

      test('should show the test as active', async () => {
        expect(await testListItems[0].isSelected()).true;
      });

      test('should show the drawer', async () => {
        await page.testView.testDrawer.whenHalfOpen();
      });

      test('should be able to deselect', async () => {
        await testListItems[0].toggle();
        expect(await testListItems[0].isSelected()).false;
      });

      test('should deselect when selecting another test', async () => {
        await testListItems[1].toggle();
        expect(await testListItems[0].isSelected()).false;
        expect(await testListItems[1].isSelected()).true;
      });
    });
  });

  test.describe('test report without files', () => {
    test.beforeEach(async () => {
      await page.navigateTo('tests-example/#test');
    });

    test('should simply list all tests in a list box', async () => {
      const testDots = await page.testView.testDots();
      const testListItems = await page.testView.testListItems();
      expect(testDots).lengthOf(0);
      expect(testListItems).lengthOf(82);
    });
  });
});
