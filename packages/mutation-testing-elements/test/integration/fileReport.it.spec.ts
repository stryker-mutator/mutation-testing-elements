import { expect } from 'chai';
import { ReportPage } from './po/ReportPage';
import { MutantStatus } from 'mutation-testing-report-schema';
import { MutantComponent } from './po/MutantComponent.po';
import { getCurrent } from './lib/browser';

describe('File report "install-local-example/Options.ts"', () => {
  let page: ReportPage;

  beforeEach(async () => {
    page = new ReportPage(getCurrent());
    await page.navigateTo('install-local-example/#mutant/Options.ts');
    await page.whenFileReportLoaded();
  });

  it('should show 51 mutants in the file', async () => {
    expect(await page.mutantView.mutants()).lengthOf(51);
  });

  it('should not "line-through" any of the original code lines', async () => {
    for await (const mutant of await page.mutantView.mutants()) {
      const [decoration, isMutantReplacementVisible] = await Promise.all([
        mutant.originalCodeTextDecoration(),
        mutant.isMutantReplacementCodeVisible(),
      ]);
      expect(decoration).eq('none');
      expect(isMutantReplacementVisible).eq(false);
    }
  });

  it('should only filter Survived and NoCoverage mutants by default', async () => {
    const filter = page.mutantView.stateFilter();
    expect(await filter.state(MutantStatus.Killed).isChecked()).false;
    expect(await filter.state(MutantStatus.Survived).isChecked()).true;
    expect(await filter.state(MutantStatus.NoCoverage).isChecked()).true;
    expect(await filter.state(MutantStatus.CompileError).isChecked()).false;
  });

  it('should hide killed mutants', async () => {
    expect(await page.mutantView.mutant(1).isButtonVisible()).false;
    expect(await page.mutantView.mutant(21).isButtonVisible()).false;
  });

  it('should show Survived mutants', async () => {
    expect(await page.mutantView.mutant(20).isButtonVisible()).true;
    expect(await page.mutantView.mutant(32).isButtonVisible()).true;
  });

  it('should show NoCoverage mutants', async () => {
    expect(await page.mutantView.mutant(37).isButtonVisible()).true;
    expect(await page.mutantView.mutant(38).isButtonVisible()).true;
  });

  describe('when "Killed" is enabled', () => {
    beforeEach(async () => {
      await page.mutantView.stateFilter().state(MutantStatus.Killed).click();
    });

    it('should also show the killed mutants', async () => {
      expect(await page.mutantView.mutant(1).isButtonVisible()).true;
      expect(await page.mutantView.mutant(15).isButtonVisible()).true;
    });

    describe('and a killed mutant is enabled', () => {
      let mutant: MutantComponent;
      beforeEach(async () => {
        mutant = page.mutantView.mutant(1);
        await mutant.toggleMutant();
      });

      it('should "line-through" the original code', async () => {
        expect(await mutant.originalCodeTextDecoration()).eq('line-through');
      });

      describe('and later "Killed" is disabled', () => {
        beforeEach(async () => {
          await page.mutantView.stateFilter().state(MutantStatus.Killed).click();
        });

        it('should have removed the "line-through" from the mutant\'s original code', async () => {
          expect(await mutant.originalCodeTextDecoration()).eq('none');
        });

        it('should hide the killed mutants', async () => {
          expect(await mutant.isButtonVisible()).false;
        });
      });
    });
  });

  describe('when first visible mutant is enabled', () => {
    let mutant: MutantComponent;

    beforeEach(async () => {
      mutant = page.mutantView.mutant(20);
      await mutant.toggleMutant();
    });

    it('should "line-through" the originalCode', async () => {
      expect(await mutant.originalCodeTextDecoration()).eq('line-through');
    });

    it('should show the drawer', async () => {
      await page.mutantView.mutantDrawer().whenHalfOpen();
    });

    it('should show the mutated code', async () => {
      expect(await mutant.isMutantReplacementCodeVisible()).true;
    });

    describe('and later disabled', () => {
      beforeEach(async () => {
        await mutant.toggleMutant();
      });

      it('should remove the "line-through" from the original code', async () => {
        expect(await mutant.originalCodeTextDecoration()).eq('none');
      });

      it('should hide the drawer', async () => {
        await page.mutantView.mutantDrawer().whenClosed();
      });

      it('should hide the mutated code', async () => {
        expect(await mutant.isMutantReplacementCodeVisible()).false;
      });
    });
  });
});
