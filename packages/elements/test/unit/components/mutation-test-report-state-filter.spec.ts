import { MutationTestReportFileStateFilterComponent, StateFilter } from '../../../src/components/state-filter/state-filter.component';
import { CustomElementFixture } from '../helpers/CustomElementFixture';
import { MutantStatus } from 'mutation-testing-report-schema/api';
import { expect } from 'chai';
import { normalizeWhitespace, expectedMutantColors } from '../../helpers/helperFunctions';
import { getContextClassForStatus, getEmojiForStatus } from '../../../src/lib/htmlHelpers';

function createStateFilter(status: MutantStatus): StateFilter<MutantStatus> {
  return {
    count: 1,
    context: getContextClassForStatus(status),
    enabled: [MutantStatus.Survived, MutantStatus.NoCoverage, MutantStatus.Timeout].includes(status),
    label: `${getEmojiForStatus(status)} ${status}`,
    status,
  };
}

describe(MutationTestReportFileStateFilterComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportFileStateFilterComponent<MutantStatus>>;

  beforeEach(async () => {
    sut = new CustomElementFixture('mte-state-filter');
    await sut.whenStable();
  });

  afterEach(() => {
    sut.dispose();
  });

  describe('filter buttons', () => {
    it('should display no checkboxes without filters', () => {
      expect(sut.$$('input[checkbox]')).lengthOf(0);
    });

    it('should display checkboxes for all states', async () => {
      // Arrange
      sut.element.filters = [
        MutantStatus.Killed,
        MutantStatus.Survived,
        MutantStatus.NoCoverage,
        MutantStatus.Ignored,
        MutantStatus.Timeout,
        MutantStatus.CompileError,
        MutantStatus.RuntimeError,
      ].map(createStateFilter);

      // Act
      await sut.whenStable();

      // Assert
      const actualCheckboxes = sut.$$('.form-check.form-check-inline');
      expect(actualCheckboxes).lengthOf(7);
      const checkboxTexts = actualCheckboxes.map((checkbox) => normalizeWhitespace(checkbox.textContent as string));
      expect(checkboxTexts).deep.eq([
        '✅ Killed (1)',
        '👽 Survived (1)',
        '🙈 NoCoverage (1)',
        '🤥 Ignored (1)',
        '⌛ Timeout (1)',
        '💥 CompileError (1)',
        '💥 RuntimeError (1)',
      ]);
    });

    Object.keys(expectedMutantColors).forEach((status) => {
      it(`should render correct badge color for ${status} mutant`, async () => {
        // Arrange
        const mutantStatus = status as MutantStatus;
        sut.element.style.cssText = `--bs-badge-${getContextClassForStatus(mutantStatus)}-bg: ${expectedMutantColors[mutantStatus]};`;
        const expectedColor = expectedMutantColors[mutantStatus];
        sut.element.filters = [createStateFilter(mutantStatus)];

        // Act
        await sut.whenStable();

        // Assert
        const badge = sut.$(`[data-status=${status}] .badge`);
        expect(getComputedStyle(badge).backgroundColor).eq(expectedColor);
      });
    });

    it('should dispatch the "filters-changed" event for the initial state', async () => {
      const expectedFilters = [
        MutantStatus.CompileError,
        MutantStatus.Killed,
        MutantStatus.NoCoverage,
        MutantStatus.RuntimeError,
        MutantStatus.Survived,
        MutantStatus.Timeout,
        MutantStatus.Ignored,
      ].map(createStateFilter);
      const actualEvent = await sut.catchCustomEvent('filters-changed', () => {
        sut.element.filters = expectedFilters;
      });
      expect(actualEvent).ok;
      expect(actualEvent!.detail).deep.eq(expectedFilters);
    });

    it('should dispatch the "filters-changed" event when a checkbox is checked', async () => {
      // Arrange
      const inputFilters = [MutantStatus.CompileError, MutantStatus.Survived].map(createStateFilter);
      inputFilters[0].enabled = false;
      inputFilters[1].enabled = true;
      sut.element.filters = inputFilters;
      await sut.whenStable();
      const expected = [MutantStatus.CompileError, MutantStatus.Survived].map(createStateFilter);
      expected[0].enabled = false;
      expected[1].enabled = false;

      // Act
      const actualEvent = await sut.catchCustomEvent('filters-changed', () => {
        sut.$(`input[type="checkbox"][value="${MutantStatus.Survived}"]`).click();
      });

      // Assert
      expect(actualEvent).ok;
      expect(actualEvent!.detail).deep.eq(expected);
    });
  });

  describe('Collapse/expand button', () => {
    let collapseButton: HTMLElement;
    beforeEach(async () => {
      sut.element.allowToggleAll = true;
      await sut.whenStable();
      collapseButton = sut.$('button.btn-secondary');
    });

    it('should not show "Expand all" when "allowToggleAll" is false', async () => {
      sut.element.allowToggleAll = false;
      await sut.whenStable();
      collapseButton = sut.$('button.btn-secondary');
      expect(collapseButton).null;
    });

    it('should show "Expand all" button when "allowToggleAll" is true', () => {
      expect(collapseButton.textContent).eq('Expand all');
    });

    it('should dispatch "expand-all" event when the button is clicked', async () => {
      let actual: Event | undefined;
      sut.element.addEventListener('expand-all', (evt) => (actual = evt));
      collapseButton.click();
      await sut.whenStable();
      expect(actual).ok;
    });

    it('should dispatch "collapse-all" event when the button is clicked a second time', async () => {
      let actual: Event | undefined;
      sut.element.addEventListener('collapse-all', (evt) => (actual = evt));
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
