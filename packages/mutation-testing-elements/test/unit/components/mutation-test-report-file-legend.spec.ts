import { MutationTestReportFileLegendComponent, MutantFilter } from '../../../src/components/mutation-test-report-file-legend';
import { CustomElementFixture } from '../helpers/CustomElementFixture';
import { MutantStatus } from 'mutation-testing-report-schema';
import { expect } from 'chai';
import { normalizeWhitespace, expectedMutantColors } from '../../helpers/helperFunctions';

describe(MutationTestReportFileLegendComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportFileLegendComponent>;

  beforeEach(async () => {
    sut = new CustomElementFixture('mutation-test-report-file-legend');
    await sut.whenStable();
  });

  afterEach(() => {
    sut.dispose();
  });

  describe('filter buttons', () => {
    it('should display no checkboxes without mutants', () => {
      expect(sut.$$('input[checkbox]')).lengthOf(0);
    });

    it('should display checkboxes for all states', async () => {
      sut.element.mutants = [
        { status: MutantStatus.CompileError },
        { status: MutantStatus.Killed },
        { status: MutantStatus.NoCoverage },
        { status: MutantStatus.RuntimeError },
        { status: MutantStatus.Survived },
        { status: MutantStatus.Timeout },
        { status: MutantStatus.Ignored }
      ];
      await sut.whenStable();
      const actualCheckboxes = sut.$$('.form-check.form-check-inline');
      expect(actualCheckboxes).lengthOf(7);
      const checkboxTexts = actualCheckboxes.map(checkbox => normalizeWhitespace((checkbox.textContent as string)));
      expect(checkboxTexts).deep.eq([
        '✅ Killed (1)',
        '👽 Survived (1)',
        '🙈 NoCoverage (1)',
        '🤥 Ignored (1)',
        '⌛ Timeout (1)',
        '💥 CompileError (1)',
        '💥 RuntimeError (1)'
      ]);
    });

    Object.keys(expectedMutantColors).forEach(status => {
      it(`should render correct badge color for ${status} mutant`, async () => {
        // Arrange
        const mutantStatus = status as MutantStatus;
        const expectedColor = expectedMutantColors[mutantStatus];
        sut.element.mutants = [{ status: mutantStatus }];

        // Act
        await sut.whenStable();

        // Assert
        const badge = sut.$(`[data-status=${status}] .badge`);
        expect(getComputedStyle(badge).backgroundColor).eq(expectedColor);
      });
    });

    it('should dispatch the "filters-changed" event for the initial state', async () => {
      let actualEvent: CustomEvent | undefined;
      sut.element.addEventListener('filters-changed', (ev: any) => (actualEvent = ev));
      sut.element.mutants = [
        { status: MutantStatus.CompileError },
        { status: MutantStatus.Killed },
        { status: MutantStatus.NoCoverage },
        { status: MutantStatus.RuntimeError },
        { status: MutantStatus.Survived },
        { status: MutantStatus.Timeout },
        { status: MutantStatus.Ignored }
      ];
      const expected: MutantFilter[] = [
        { enabled: false, numberOfMutants: 1, status: MutantStatus.Killed },
        { enabled: true, numberOfMutants: 1, status: MutantStatus.Survived },
        { enabled: true, numberOfMutants: 1, status: MutantStatus.NoCoverage },
        { enabled: false, numberOfMutants: 1, status: MutantStatus.Ignored },
        { enabled: true, numberOfMutants: 1, status: MutantStatus.Timeout },
        { enabled: false, numberOfMutants: 1, status: MutantStatus.CompileError },
        { enabled: false, numberOfMutants: 1, status: MutantStatus.RuntimeError }];
      await sut.whenStable();
      expect(actualEvent).ok;
      expect((actualEvent as CustomEvent).detail).deep.eq(expected);
    });

    it('should dispatch the "filters-changed" event when a checkbox is checked', async () => {
      // Arrange
      sut.element.mutants = [
        { status: MutantStatus.CompileError },
        { status: MutantStatus.Survived }
      ];
      const r = await sut.whenStable();
      console.log(r);
      let actualEvent: CustomEvent | undefined;
      sut.element.addEventListener('filters-changed', (ev: any) => (actualEvent = ev));
      const expected: MutantFilter[] = [
        { enabled: false, numberOfMutants: 1, status: MutantStatus.Survived },
        { enabled: false, numberOfMutants: 1, status: MutantStatus.CompileError }
      ];

      // Act
      sut.$(`input[type="checkbox"][value="${MutantStatus.Survived}"]`).click();
      await sut.whenStable();

      // Assert
      expect(actualEvent).ok;
      expect((actualEvent as CustomEvent).detail).deep.eq(expected);
    });
  });

  describe('Collapse/expand button', () => {
    let collapseButton: HTMLElement;
    beforeEach(() => {
      collapseButton = sut.$('button.btn-secondary');
    });

    it('should show "Expand all" button', () => {
      expect(collapseButton.textContent).eq('Expand all');
    });

    it('should dispatch "expand-all" event when the button is clicked', async () => {
      let actual: Event | undefined;
      sut.element.addEventListener('expand-all', evt => (actual = evt));
      collapseButton.click();
      await sut.whenStable();
      expect(actual).ok;
    });

    it('should dispatch "collapse-all" event when the button is clicked a second time', async () => {
      let actual: Event | undefined;
      sut.element.addEventListener('collapse-all', evt => (actual = evt));
      collapseButton.click();
      await sut.whenStable();
      expect(actual).not.ok;
      collapseButton.click();
      await sut.whenStable();
      expect(actual).ok;
    });

    it('should toggle the text to "Collapse all" when clicked', async () => {
      collapseButton.click();
      await sut.whenStable();
      expect(collapseButton.textContent).eq('Collapse all');
    });
  });
});
