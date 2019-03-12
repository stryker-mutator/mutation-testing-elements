import { MutationTestReportMutantComponent } from '../../../src/components/mutation-test-report-mutant';
import { CustomElementFixture } from '../helpers/CustomElementFixture';
import { expect } from 'chai';
import { MutantStatus, MutantResult } from 'mutation-testing-report-schema';

describe(MutationTestReportMutantComponent.name, () => {

  let sut: CustomElementFixture<MutationTestReportMutantComponent>;
  beforeEach(async () => {
    sut = new CustomElementFixture('mutation-test-report-mutant');
    await sut.updateComplete;
  });

  afterEach(() => {
    sut.dispose();
  });

  it  ('should not render when show = false', async () => {
    sut.element.show = false;
    sut.element.mutant = createMutantResult();
    await sut.updateComplete;
    const badge = sut.$('span.badge');
    expect(getComputedStyle(badge).display).eq('none');
  });

  it('should not render when mutant is undefined', async () => {
    sut.element.show = true;
    await sut.updateComplete;
    expect(sut.$('span.badge')).not.ok;
  });

  it('should render when show = true and mutant is set', async () => {
    sut.element.show = true;
    sut.element.mutant = createMutantResult();
    await sut.updateComplete;
    expect(sut.$('span.badge')).ok;
  });

  it('should always show slotted content', () => {
    expect(sut.$('slot')).ok;
  });

  it('should hide replacement', async () => {
    sut.element.show = true;
    sut.element.mutant = createMutantResult();
    await sut.updateComplete;
    expect(sut.$('.replacement').hidden).true;
  });

  it('should render correct badge color for mutant', async () => {
    sut.element.show = true;
    sut.element.mutant = createMutantResult({ status: MutantStatus.Survived });
    await sut.updateComplete;
    const badge = sut.$('span.badge');
    expect(getComputedStyle(badge).background).match(/rgb\(220, 53, 69\)/);
    expect(badge.innerText).eq(sut.element.mutant.id);
  });

  it('should render replacement when the button is clicked', async () => {
    // Arrange
    sut.element.show = true;
    sut.element.mutant = createMutantResult({ replacement: 'foobar' });
    await sut.updateComplete;
    const actualReplacement = sut.$('.badge-info');

    // Act
    sut.$('span.badge').click();
    await sut.updateComplete;

    // Assert
    expect(actualReplacement.hidden).false;
    expect(actualReplacement.textContent).eq('foobar');
  });

  it('should line-through original code when the button is cliced', async () => {
    // Arrange
    sut.element.show = true;
    sut.element.mutant = createMutantResult({ replacement: 'foobar' });
    sut.element.innerHTML = '<span>inner code</span>';
    await sut.updateComplete;

    // Act
    sut.$('span.badge').click();
    await sut.updateComplete;

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
        start: { line: 3, column: 4 }
      },
      mutatorName: 'fooMutator',
      replacement: '+',
      status: MutantStatus.Timeout
    };
    return { ...defaults, ...overrides };
  }
});
