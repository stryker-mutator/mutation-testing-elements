import { expect } from 'chai';
import { ReportPage } from './po/ReportPage';
import { MutantStatus } from 'mutation-testing-report-schema/api';
import { MutantDot } from './po/MutantDot.po';
import { getCurrent } from './lib/browser';
import { MutantMarker } from './po/MutantMarker.po';
import { itShouldMatchScreenshot, waitUntil } from './lib/helpers';

describe('File report "install-local-example/Options.ts"', () => {
  let page: ReportPage;

  beforeEach(async () => {
    page = new ReportPage(getCurrent());
    await page.navigateTo('install-local-example/#mutant/Options.ts');
    await page.whenFileReportLoaded();
  });

  it('should show survived and no coverage mutants by default', async () => {
    expect(await page.mutantView.mutantDots()).lengthOf(5);
    const mutantSurvived = page.mutantView.mutantMarker(20);
    const mutantKilled = page.mutantView.mutantMarker(11);
    expect(await mutantSurvived.underlineIsVisible()).true;
    expect(await mutantKilled.underlineIsVisible()).false;
    expect(await mutantSurvived.getStatus()).eq(MutantStatus.Survived);
    expect(await mutantKilled.getStatus()).eq(MutantStatus.Killed);
  });

  it('should not show a diff', async () => {
    expect(await page.mutantView.currentDiff()).null;
  });

  it('should only filter Survived and NoCoverage mutants by default', async () => {
    const filter = page.mutantView.stateFilter();
    expect(await filter.state(MutantStatus.Killed).isChecked()).false;
    expect(await filter.state(MutantStatus.Survived).isChecked()).true;
    expect(await filter.state(MutantStatus.NoCoverage).isChecked()).true;
    expect(await filter.state(MutantStatus.CompileError).isChecked()).false;
  });

  it('should hide killed mutants', async () => {
    expect(await page.mutantView.mutantDot(1).isVisible()).false;
    expect(await page.mutantView.mutantDot(21).isVisible()).false;
    expect(await page.mutantView.mutantMarker(1).underlineIsVisible()).false;
    expect(await page.mutantView.mutantMarker(21).underlineIsVisible()).false;
  });

  it('should show Survived mutants', async () => {
    expect(await page.mutantView.mutantDot(20).isVisible()).true;
    expect(await page.mutantView.mutantDot(32).isVisible()).true;
    expect(await page.mutantView.mutantMarker(20).underlineIsVisible()).true;
    expect(await page.mutantView.mutantMarker(32).underlineIsVisible()).true;
  });

  it('should show NoCoverage mutants', async () => {
    expect(await page.mutantView.mutantDot(37).isVisible()).true;
    expect(await page.mutantView.mutantDot(38).isVisible()).true;
    expect(await page.mutantView.mutantMarker(37).underlineIsVisible()).true;
    expect(await page.mutantView.mutantMarker(38).underlineIsVisible()).true;
  });

  describe('when "Killed" is enabled', () => {
    beforeEach(async () => {
      await page.mutantView.stateFilter().state(MutantStatus.Killed).click();
    });

    it('should also show the killed mutants', async () => {
      expect(await page.mutantView.mutantDot(1).isVisible()).true;
      expect(await page.mutantView.mutantMarker(1).underlineIsVisible()).true;
      expect(await page.mutantView.mutantDot(15).isVisible()).true;
      expect(await page.mutantView.mutantMarker(15).underlineIsVisible()).true;
    });

    describe('and a killed mutant is selected', () => {
      let mutantDot: MutantDot;
      let mutantMarker: MutantMarker;
      beforeEach(async () => {
        mutantDot = page.mutantView.mutantDot(1);
        mutantMarker = page.mutantView.mutantMarker(1);
        await mutantDot.toggle();
      });

      it('should show the diff inline', async () => {
        const { original, mutated } = (await page.mutantView.currentDiff())!;
        expect(original).eq('.filter((_, i) => i > 1);');
        expect(mutated).eq('.filter(() => undefined);');
      });

      describe('and later "Killed" is disabled', () => {
        beforeEach(async () => {
          await page.mutantView.stateFilter().state(MutantStatus.Killed).click();
        });

        it('should remove the diff', async () => {
          expect(await page.mutantView.currentDiff()).null;
        });

        it('should hide the killed mutants', async () => {
          expect(await mutantDot.isVisible()).false;
          expect(await mutantMarker.underlineIsVisible()).false;
        });
      });
    });
  });

  describe('when first visible mutant is enabled', () => {
    let mutant: MutantDot;

    beforeEach(async () => {
      mutant = page.mutantView.mutantDot(20);
      await mutant.toggle();
    });

    it('should show the diff', async () => {
      expect(await page.mutantView.currentDiff()).ok; // exact diff is already tested numerous times
    });

    it('should show the drawer', async () => {
      await page.mutantView.mutantDrawer().whenHalfOpen();
    });

    describe('and later disabled', () => {
      beforeEach(async () => {
        await mutant.toggle();
      });

      it('should remove diff', async () => {
        expect(await page.mutantView.currentDiff()).null;
      });

      it('should hide the drawer', async () => {
        await page.mutantView.mutantDrawer().whenClosed();
      });
    });
  });

  describe('when navigating "previous mutant"', () => {
    beforeEach(async () => {
      await page.mutantView.stateFilter().previous();
      await waitUntil(async () => {
        const posAfter = await page.pageYOffset();
        return expect(posAfter).gt(100);
      });
    });

    // next and previous test already unit tested, so only focus on the part that wasn't unit tested
    it('should scroll and focus the last test when "previous" is called', async () => {
      const posAfter = await page.pageYOffset();
      expect(posAfter).gt(100);
      expect(await (await page.mutantView.mutantDots()).slice(-1)[0].isActive()).true;
    });

    itShouldMatchScreenshot('should look as expected');
  });
});
