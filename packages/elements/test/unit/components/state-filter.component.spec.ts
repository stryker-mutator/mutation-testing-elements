import { html } from 'lit';
import type { MutantStatus } from 'mutation-testing-report-schema/api';

import type { StateFilter } from '../../../src/components/state-filter/state-filter.component.js';
import { FileStateFilterComponent } from '../../../src/components/state-filter/state-filter.component.js';
import { getContextClassForStatus, getEmojiForStatus } from '../../../src/lib/html-helpers.js';
import { CustomElementFixture } from '../helpers/CustomElementFixture.js';
import { expectedMutantColors, normalizeWhitespace } from '../helpers/helperFunctions.js';

function createStateFilter(status: MutantStatus): StateFilter<MutantStatus> {
  return {
    count: 1,
    context: getContextClassForStatus(status),
    enabled: ['Survived', 'NoCoverage', 'Timeout'].includes(status),
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
      sut.element.filters = (['Killed', 'Survived', 'NoCoverage', 'Ignored', 'Timeout', 'CompileError', 'RuntimeError'] satisfies MutantStatus[]).map(
        createStateFilter,
      );

      // Act
      await sut.whenStable();

      // Assert
      const actualCheckboxes = sut.$$('input[type=checkbox]');
      expect(actualCheckboxes).lengthOf(7);
      const checkboxTexts = sut.$$('input[type=checkbox] + label').map((checkbox) => normalizeWhitespace(checkbox.textContent!));
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

    it.each(Object.entries(expectedMutantColors))('should render correct badge color for %s mutant', async (status, expectedColor) => {
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

    it('should dispatch the "filters-changed" event for the initial state', async () => {
      const states: MutantStatus[] = ['CompileError', 'Killed', 'NoCoverage', 'RuntimeError', 'Survived', 'Timeout', 'Ignored'];
      const filters = states.map(createStateFilter);
      const actualEvent = await sut.catchCustomEvent('filters-changed', () => {
        sut.element.filters = filters;
      });
      expect(actualEvent).ok;
      expect(actualEvent!.detail).deep.eq(['NoCoverage', 'Survived', 'Timeout']);
    });

    it('should dispatch the "filters-changed" event with an empty array when a checkbox is de-selected', async () => {
      // Arrange
      const inputFilters = (['CompileError', 'Survived'] satisfies MutantStatus[]).map(createStateFilter);
      inputFilters[0].enabled = false;
      inputFilters[1].enabled = true;
      sut.element.filters = inputFilters;
      await sut.whenStable();

      // Act
      const actualEvent = await sut.catchCustomEvent('filters-changed', () => {
        sut.$<HTMLInputElement>(`input[type="checkbox"][value="${'Survived'}"]`).click();
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
