import { MutationTestReportMutantComponent } from '../../../src/components/mutant/mutant.component';
import { CustomElementFixture } from '../helpers/CustomElementFixture';
import { expect } from 'chai';
import { MutantStatus, MutantResult } from 'mutation-testing-report-schema/api';
import { expectedMutantColors } from '../../helpers/helperFunctions';
import { getContextClassForStatus } from '../../../src/lib/htmlHelpers';
import { CustomEventMap } from '../../../src/lib/custom-events';
import { MutantModel } from 'mutation-testing-metrics';

describe(MutationTestReportMutantComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportMutantComponent>;
  beforeEach(async () => {
    sut = new CustomElementFixture('mte-mutant');
    await sut.whenStable();
  });

  afterEach(() => {
    sut.dispose();
  });

  it('should not render when show = false', async () => {
    sut.element.show = false;
    sut.element.mutant = new MutantModel(createMutantResult());
    await sut.whenStable();
    const badge = sut.$('span.badge');
    expect(getComputedStyle(badge).display).eq('none');
  });

  it('should not render when mutant is undefined', async () => {
    sut.element.show = true;
    await sut.whenStable();
    expect(sut.$('span.badge')).not.ok;
  });

  it('should render when show = true and mutant is set', async () => {
    sut.element.show = true;
    sut.element.mutant = new MutantModel(createMutantResult());
    await sut.whenStable();
    expect(sut.$('span.badge')).ok;
  });

  it('should always show slotted content', () => {
    expect(sut.$('slot')).ok;
  });

  it('should hide replacement', async () => {
    sut.element.show = true;
    sut.element.mutant = new MutantModel(createMutantResult());
    await sut.whenStable();
    expect(sut.$('.replacement').hidden).true;
  });

  Object.entries(expectedMutantColors).forEach(([status, expectedColor]) => {
    it(`should render correct badge color for ${status} mutant`, async () => {
      const actualMutantStatus = status as MutantStatus;
      sut.element.style.cssText = `--bs-${getContextClassForStatus(actualMutantStatus)}-bg: ${expectedColor};`;
      sut.element.show = true;
      sut.element.mutant = new MutantModel(createMutantResult({ status: actualMutantStatus }));
      await sut.whenStable();
      const badge = sut.$('span.badge');
      expect(getComputedStyle(badge).backgroundColor).eq(expectedColor);
      expect(badge.innerText).eq(sut.element.mutant.id);
    });
  });

  it('should render replacement when the button is clicked', async () => {
    // Arrange
    sut.element.show = true;
    sut.element.mutant = new MutantModel(createMutantResult({ replacement: 'foobar' }));
    await sut.whenStable();
    const actualReplacement = sut.$('.bg-info');

    // Act
    sut.$('span.badge').click();
    await sut.whenStable();

    // Assert
    expect(actualReplacement.hidden).false;
    expect(actualReplacement.textContent).eq('foobar');
  });

  it('should dispatch "mutant-selected" event with "selected" true when the mutant is opened', async () => {
    // Arrange
    const expectedEventDetail: CustomEventMap['mutant-selected'] = {
      selected: true,
      mutant: new MutantModel(createMutantResult({ replacement: 'foobar' })),
    };
    sut.element.mutant = expectedEventDetail.mutant;
    sut.element.show = true;
    await sut.whenStable();

    // Act
    const actualEvent = await sut.catchCustomEvent('mutant-selected', () => sut.$('span.badge').click());

    // Assert
    expect(actualEvent?.detail).deep.eq(expectedEventDetail);
  });

  it('should dispatch "mutant-selected" event with "selected" false when the mutant is opened', async () => {
    // Arrange
    const expectedEventDetail: CustomEventMap['mutant-selected'] = {
      selected: false,
      mutant: new MutantModel(createMutantResult({ replacement: 'foobar' })),
    };
    sut.element.mutant = expectedEventDetail.mutant;
    sut.element.show = true;
    sut.element.expand = true;
    await sut.whenStable();

    // Act
    const actualEvent = await sut.catchCustomEvent('mutant-selected', () => sut.$('span.badge').click());

    // Assert
    expect(actualEvent?.detail).deep.eq(expectedEventDetail);
  });

  it('should fill the replacement with mutator name if no replacement is defined', async () => {
    // Arrange
    sut.element.show = true;
    sut.element.mutant = new MutantModel(createMutantResult({ mutatorName: 'FooMutator', replacement: undefined }));
    await sut.whenStable();
    const actualReplacement = sut.$('.bg-info');

    // Act
    sut.$('span.badge').click();
    await sut.whenStable();

    // Assert
    expect(actualReplacement.hidden).false;
    expect(actualReplacement.textContent).eq('FooMutator');
  });

  it('should hide replacement when the button is clicked again', async () => {
    // Arrange
    sut.element.show = true;
    sut.element.mutant = new MutantModel(createMutantResult({ replacement: 'foobar' }));
    await sut.whenStable();
    const actualReplacement = sut.$('.bg-info');

    // Act
    sut.$('span.badge').click(); // Open
    sut.$('span.badge').click(); // Close
    await sut.whenStable();

    // Assert
    expect(actualReplacement.hidden).true;
    expect(actualReplacement.textContent).eq('foobar');
  });

  it('should line-through original code when the button is clicked', async () => {
    // Arrange
    sut.element.show = true;
    sut.element.mutant = new MutantModel(createMutantResult({ replacement: 'foobar' }));
    sut.element.innerHTML = '<span>inner code</span>';
    await sut.whenStable();

    // Act
    sut.$('span.badge').click();
    await sut.whenStable();

    // Assert
    // Select from the 'light-dom'
    const actualOriginalCode = sut.$('.original-code');
    expect(getComputedStyle(actualOriginalCode).textDecoration).matches(/line-through/);
  });

  function createMutantResult(overrides?: Partial<MutantResult>) {
    const defaults: MutantResult = {
      id: '42',
      location: {
        end: { column: 3, line: 4 },
        start: { line: 3, column: 4 },
      },
      mutatorName: 'fooMutator',
      replacement: '+',
      status: MutantStatus.Timeout,
    };
    return { ...defaults, ...overrides };
  }
});
