import { expect as expectPW, test } from '@playwright/test';
import { expect } from 'chai';
import { itShouldMatchScreenshot, waitUntil } from './lib/helpers.js';
import type { MutantDot } from './po/MutantDot.po.js';
import type { MutantMarker } from './po/MutantMarker.po.js';
import { ReportPage } from './po/ReportPage.js';

test.describe('File report "install-local-example/Options.ts"', () => {
  let page: ReportPage;

  test.beforeEach(async ({ page: p }) => {
    page = new ReportPage(p);
    await page.navigateTo('install-local-example/#mutant/Options.ts');
  });

  test('should show survived and no coverage mutants by default', async () => {
    expect(await page.mutantView.mutantDots()).lengthOf(5);
    const mutantSurvived = page.mutantView.mutantMarker(20);
    const mutantKilled = page.mutantView.mutantMarker(11);
    expect(await mutantSurvived.underlineIsVisible()).true;
    expect(await mutantKilled.underlineIsVisible()).false;
    expect(await mutantSurvived.getStatus()).eq('Survived');
    expect(await mutantKilled.getStatus()).eq('Killed');
  });

  test('should not show a diff', async () => {
    expect(await page.mutantView.currentDiff()).null;
  });

  test('should only filter Survived and NoCoverage mutants by default', async () => {
    const filter = page.mutantView.stateFilter();
    await expectPW(filter.state('Killed').input).not.toBeChecked();
    await expectPW(filter.state('Survived').input).toBeChecked();
    await expectPW(filter.state('NoCoverage').input).toBeChecked();
    await expectPW(filter.state('CompileError').input).not.toBeChecked();
  });

  test('should hide killed mutants', async () => {
    await page.mutantView.mutantDot(1).waitForHidden();
    await page.mutantView.mutantDot(21).waitForHidden();
    expect(await page.mutantView.mutantMarker(1).underlineIsVisible()).false;
    expect(await page.mutantView.mutantMarker(21).underlineIsVisible()).false;
  });

  test('should show Survived mutants', async () => {
    await page.mutantView.mutantDot(20).waitForVisible();
    await page.mutantView.mutantDot(32).waitForVisible();
    expect(await page.mutantView.mutantMarker(20).underlineIsVisible()).true;
    expect(await page.mutantView.mutantMarker(32).underlineIsVisible()).true;
  });

  test('should show NoCoverage mutants', async () => {
    await page.mutantView.mutantDot(37).waitForVisible();
    await page.mutantView.mutantDot(38).waitForVisible();
    expect(await page.mutantView.mutantMarker(37).underlineIsVisible()).true;
    expect(await page.mutantView.mutantMarker(38).underlineIsVisible()).true;
  });

  test.describe('when "Killed" is enabled', () => {
    test.beforeEach(async () => {
      await page.mutantView.stateFilter().state('Killed').click();
    });

    test('should also show the killed mutants', async () => {
      await page.mutantView.mutantDot(1).waitForVisible();
      expect(await page.mutantView.mutantMarker(1).underlineIsVisible()).true;
      await page.mutantView.mutantDot(15).waitForVisible();
      expect(await page.mutantView.mutantMarker(15).underlineIsVisible()).true;
    });

    test.describe('and a killed mutant is selected', () => {
      let mutantDot: MutantDot;
      let mutantMarker: MutantMarker;
      test.beforeEach(async () => {
        mutantDot = page.mutantView.mutantDot(1);
        mutantMarker = page.mutantView.mutantMarker(1);
        await mutantDot.toggle();
      });

      test('should show the diff inline', async () => {
        const { original, mutated } = (await page.mutantView.currentDiff())!;
        expect(original).eq('.filter((_, i) => i > 1);');
        expect(mutated).eq('.filter(() => undefined);');
      });

      test.describe('and later "Killed" is disabled', () => {
        test.beforeEach(async () => {
          await page.mutantView.stateFilter().state('Killed').click();
        });

        test('should remove the diff', async () => {
          expect(await page.mutantView.currentDiff()).null;
        });

        test('should hide the killed mutants', async () => {
          await mutantDot.waitForHidden();
          expect(await mutantMarker.underlineIsVisible()).false;
        });
      });
    });
  });

  test.describe('when first visible mutant is enabled', () => {
    let mutant: MutantDot;

    test.beforeEach(async () => {
      mutant = page.mutantView.mutantDot(20);
      await mutant.toggle();
    });

    test('should show the diff', async () => {
      expect(await page.mutantView.currentDiff()).ok; // exact diff is already tested numerous times
    });

    test('should show the drawer', async () => {
      await page.mutantView.mutantDrawer().whenHalfOpen();
    });

    test.describe('and later disabled', () => {
      test.beforeEach(async () => {
        await mutant.toggle();
      });

      test('should remove diff', async () => {
        expect(await page.mutantView.currentDiff()).null;
      });

      test('should hide the drawer', async () => {
        await page.mutantView.mutantDrawer().whenClosed();
      });
    });
  });

  test.describe('when navigating "previous mutant" when scrolled up', () => {
    test.beforeEach(async () => {
      await page.scrollUp();
      await page.mutantView.stateFilter().previous();
      await waitUntil(async () => {
        const posAfter = await page.pageYOffset();
        return expect(posAfter).gt(100);
      });
    });

    // next and previous test already unit tested, so only focus on the part that wasn't unit tested
    test('should scroll and focus the last test when "previous" is called', async () => {
      const posAfter = await page.pageYOffset();
      expect(posAfter).gt(100);
      expect(await (await page.mutantView.mutantDots()).slice(-1)[0].isActive()).true;
    });

    itShouldMatchScreenshot('should look as expected');
  });
});
