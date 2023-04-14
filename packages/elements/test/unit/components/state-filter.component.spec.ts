import { FileStateFilterComponent, StateFilter } from '../../../src/components/state-filter/state-filter.component';
import { CustomElementFixture } from '../helpers/CustomElementFixture';
import { MutantStatus } from 'mutation-testing-report-schema/api';
import { expect } from 'chai';
import { normalizeWhitespace, expectedMutantColors } from '../../helpers/helperFunctions';
import { getContextClassForStatus, getEmojiForStatus } from '../../../src/lib/html-helpers';
import { html } from 'lit';

function createStateFilter(status: MutantStatus): StateFilter<MutantStatus> {
  return {
    count: 1,
    context: getContextClassForStatus(status),
    enabled: [MutantStatus.Survived, MutantStatus.NoCoverage, MutantStatus.Timeout].includes(status),
    label: html`${getEmojiForStatus(status)} ${status}`,
    status,
  };
}

describe(FileStateFilterComponent.name, () => {
  let sut: CustomElementFixture<FileStateFilterComponent<MutantStatus>>;

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
      const actualCheckboxes = sut.$$('input[type=checkbox]');
      expect(actualCheckboxes).lengthOf(7);
      const checkboxTexts = sut.$$('input[type=checkbox] + label').map((checkbox) => normalizeWhitespace(checkbox.textContent as string));
      expect(checkboxTexts).deep.eq([
        '✅ Killed (1)',
        '👽 Survived (1)',
        '🙈 NoCoverage (1)',
        '🤥 Ignored (1)',
        '⏰ Timeout (1)',
        '💥 CompileError (1)',
        '💥 RuntimeError (1)',
      ]);
    });

    Object.entries(expectedMutantColors).forEach(([status, expectedColor]) => {
      it(`should render correct badge color for ${status} mutant`, async () => {
        // Arrange
        const mutantStatus = status as MutantStatus;
        sut.element.style.cssText = `--bs-${getContextClassForStatus(mutantStatus)}-bg: ${expectedColor};`;
        sut.element.filters = [createStateFilter(mutantStatus)];

        // Act
        await sut.whenStable();

        // Assert
        const badge = sut.$(`label[for=filter-${mutantStatus}]`);
        expect(getComputedStyle(badge).backgroundColor).eq(expectedColor);
      });
    });

    it('should dispatch the "filters-changed" event for the initial state', async () => {
      const states = [
        MutantStatus.CompileError,
        MutantStatus.Killed,
        MutantStatus.NoCoverage,
        MutantStatus.RuntimeError,
        MutantStatus.Survived,
        MutantStatus.Timeout,
        MutantStatus.Ignored,
      ];
      const filters = states.map(createStateFilter);
      const actualEvent = await sut.catchCustomEvent('filters-changed', () => {
        sut.element.filters = filters;
      });
      expect(actualEvent).ok;
      expect(actualEvent!.detail).deep.eq([MutantStatus.NoCoverage, MutantStatus.Survived, MutantStatus.Timeout]);
    });

    it('should dispatch the "filters-changed" event with an empty array when a checkbox is de-selected', async () => {
      // Arrange
      const inputFilters = [MutantStatus.CompileError, MutantStatus.Survived].map(createStateFilter);
      inputFilters[0].enabled = false;
      inputFilters[1].enabled = true;
      sut.element.filters = inputFilters;
      await sut.whenStable();

      // Act
      const actualEvent = await sut.catchCustomEvent('filters-changed', () => {
        sut.$<HTMLInputElement>(`input[type="checkbox"][value="${MutantStatus.Survived}"]`).click();
      });

      // Assert
      expect(actualEvent).ok;
      expect(actualEvent!.detail).lengthOf(0);
    });
  });

  describe('Next/previous button', () => {
    it('should dispatch next event when "next" is clicked', async () => {
      const nextEvent = await sut.catchCustomEvent('next', () => {
        sut.$<HTMLButtonElement>('button[title=Next]').click();
      });
      expect(nextEvent).not.null;
    });
    it('should dispatch previous event when "previous" is clicked', async () => {
      const nextEvent = await sut.catchCustomEvent('previous', () => {
        sut.$<HTMLButtonElement>('button[title=Previous]').click();
      });
      expect(nextEvent).not.null;
    });
  });
});
