import { expect } from 'chai';
import { ReportPage } from './po/ReportPage';
import { MutantStatus } from 'mutation-testing-report-schema';
import { MutantComponent } from './po/MutantComponent.po';

describe('File report "install-local-example/Options.ts"', () => {

  let page: ReportPage;

  beforeEach(async () => {
    page = new ReportPage();
    await page.navigateTo('');
    await page.navigateTo('install-local-example/#Options.ts');
  });

  it('should show title "Options.ts"', async () => {
    expect(await page.title()).eq('Options.ts');
  });

  it('should show 51 mutants in the file', async () => {
    expect(await page.mutants()).lengthOf(51);
  });

  it('should not "line-through" any of the original code lines', async () => {
    await Promise.all((await page.mutants()).map(async mutant => {
      const [decoration, isMutantReplacementVisible] = await Promise.all([mutant.originalCodeTextDecoration(), mutant.isMutantReplacementCodeVisible()]);
      expect(decoration).eq('none');
      expect(isMutantReplacementVisible).eq(false);
    }));
  });

  it('should only filter Survived and NoCoverage mutants by default', async () => {
    const legend = page.legend();
    expect(await legend.displayButton(MutantStatus.Killed).isChecked()).false;
    expect(await legend.displayButton(MutantStatus.Survived).isChecked()).true;
    expect(await legend.displayButton(MutantStatus.NoCoverage).isChecked()).true;
    expect(await legend.displayButton(MutantStatus.CompileError).isChecked()).false;
  });

  it('should hide killed mutants', async () => {
    expect(await page.mutant(1).isButtonVisible()).false;
    expect(await page.mutant(21).isButtonVisible()).false;
  });

  it('should show Survived mutants', async () => {
    expect(await page.mutant(20).isButtonVisible()).true;
    expect(await page.mutant(32).isButtonVisible()).true;
  });

  it('should show NoCoverage mutants', async () => {
    expect(await page.mutant(37).isButtonVisible()).true;
    expect(await page.mutant(38).isButtonVisible()).true;
  });

  describe('when "Killed" is enabled', () => {
    beforeEach(async () => {
      await page.legend().displayButton(MutantStatus.Killed).click();
    });

    it('should also show the killed mutants', async () => {
      expect(await page.mutant(1).isButtonVisible()).true;
      expect(await page.mutant(15).isButtonVisible()).true;
    });

    describe('and a killed mutant is enabled', () => {

      let mutant: MutantComponent;
      beforeEach(async () => {
        mutant = await page.mutant(1);
        await mutant.toggleMutant();
      });

      it('should "line-through" the original code', async () => {
        expect(await mutant.originalCodeTextDecoration()).eq('line-through');
      });

      describe('and later "Killed" is disabled', () => {
        beforeEach(async () => {
          await page.legend().displayButton(MutantStatus.Killed).click();
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
      mutant = page.mutant(20);
      await mutant.toggleMutant();
    });

    it('should "line-through" the originalCode', async () => {
      expect(await mutant.originalCodeTextDecoration()).eq('line-through');
    });

    it('should show the popup', async () => {
      expect(await mutant.popup().isVisible()).true;
    });

    it('should hide the popup when the user clicks somewhere else', async () => {
      await page.clickOnCode();
      expect(await mutant.popup().isVisible()).false;
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

      it('should hide the popup', async () => {
        expect(await mutant.popup().isVisible()).false;
      });

      it('should hide the mutated code', async () => {
        expect(await mutant.isMutantReplacementCodeVisible()).false;
      });
    });
  });
});
