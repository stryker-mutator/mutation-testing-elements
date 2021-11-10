import { CustomElementFixture } from '../helpers/CustomElementFixture';
import { FileComponent } from '../../../src/components/file/file.component';
import { expect } from 'chai';
import { FileResult, MutantStatus, MutantResult } from 'mutation-testing-report-schema/api';
import { FileStateFilterComponent, StateFilter } from '../../../src/components/state-filter/state-filter.component';
import { createFileResult, createMutantResult } from '../../helpers/factory';
import { createCustomEvent } from '../../../src/lib/custom-events';
import { FileUnderTestModel } from 'mutation-testing-metrics';

describe.only(FileComponent.name, () => {
  let sut: CustomElementFixture<FileComponent>;
  let fileResult: FileResult;

  beforeEach(async () => {
    fileResult = createFileResult();
    sut = new CustomElementFixture('mte-file', { autoConnect: false });
    sut.element.model = new FileUnderTestModel(fileResult, 'foo.js');
    sut.connect();
    await sut.whenStable();
  });

  afterEach(() => {
    sut.dispose();
  });

  it('should show the code', () => {
    expect(sut.$('code').textContent).eq(fileResult.source);
  });

  it('should highlight the code', () => {
    expect(sut.$('code .token')).ok;
  });

  describe('with mutants', () => {
    let legendComponent: FileStateFilterComponent<MutantStatus>;

    beforeEach(() => {
      legendComponent = sut.$('mte-state-filter');
    });

    // TODO Next, previous

    it('should update hide a mutant if it is filtered', async () => {
      // Arrange
      const filters: StateFilter<MutantStatus>[] = [
        {
          enabled: false,
          count: 1,
          status: MutantStatus.Killed,
          context: 'success',
          label: '✅ Killed',
        },
      ];

      // Act
      legendComponent.dispatchEvent(createCustomEvent('filters-changed', filters));
      await sut.whenStable();

      // Assert
      expect(sut.$$('.mutant-dot')).lengthOf(0);
    });

    it('should insert mutant-dot elements at the end of the line', async () => {
      const input = new FileUnderTestModel(
        {
          language: 'javascript',
          mutants: [
            {
              id: '1',
              location: { end: { column: 13, line: 3 }, start: { column: 10, line: 3 } },
              mutatorName: 'MethodReplacement',
              replacement: 'foo',
              status: MutantStatus.NoCoverage,
            },
            {
              id: '2',
              location: { end: { column: 999 /*Doesn't exist*/, line: 4 }, start: { column: 15, line: 4 } },
              mutatorName: 'SemicolonRemover',
              replacement: '',
              status: MutantStatus.Survived,
            },
            {
              id: '3',
              location: { end: { column: 1, line: 9999 /*Doesn't exist*/ }, start: { column: 15, line: 9999 } },
              mutatorName: 'SemicolonRemover',
              replacement: '',
              status: MutantStatus.Survived,
            },
          ],

          source: `const foo = 'bar';

    function add(a, b) {
      return a + b;
    }`
            .replace(/ {6}/g, '')
            .trim(), // strip the padding left
        },
        'foo.js'
      );
      sut.element.model = input;
      await sut.whenStable();
      const mutant1 = sut.$('code tr:nth-child(3) svg[mutant-id="1"]');
      const mutant2 = sut.$('code tr:nth-child(4) svg[mutant-id="2"]');
      const mutant3 = sut.$('code tr:nth-child(5) svg[mutant-id="3"]');
      expect(mutant1).ok;
      expect(mutant2).ok;
      expect(mutant3).ok;
    });

    it('should report mutant status correctly', async () => {
      // Arrange
      const allStates = [
        MutantStatus.CompileError,
        MutantStatus.Ignored,
        MutantStatus.Killed,
        MutantStatus.NoCoverage,
        MutantStatus.RuntimeError,
        MutantStatus.Survived,
        MutantStatus.Timeout,
      ];
      const mutants: MutantResult[] = allStates.map((status, i) => {
        const id = i + 1;
        const line = id;
        return {
          id: id.toString(),
          location: { start: { column: 1, line }, end: { column: 4, line } },
          mutatorName: 'MethodReplacement',
          replacement: 'bar',
          status,
        };
      });
      const input = new FileUnderTestModel(
        {
          language: 'javascript',
          mutants,
          source: mutants.map(() => 'foo').join('\n'),
        },
        'foo.js'
      );
      sut.element.model = input;
      const filters: StateFilter<MutantStatus>[] = allStates.map((status) => ({ enabled: true, count: 1, status, context: '', label: '' }));
      legendComponent.dispatchEvent(createCustomEvent('filters-changed', filters));

      // Act
      await sut.whenStable();

      // Assert
      allStates.forEach((status) => {
        const mutant = sut.$<HTMLSpanElement>(`code span.mutant.${status}`);
        // Actual underline style is tested in e2e test
        expect(mutant.innerText).eq('foo');
      });
    });
  });

  describe('selecting mutants', () => {
    beforeEach(async () => {
      const input = new FileUnderTestModel(
        {
          language: 'javascript',
          mutants: [
            createMutantResult({
              id: '1',
              replacement: '-',
              status: MutantStatus.NoCoverage,
              mutatorName: 'ArithmeticOperator',
              location: { start: { line: 3, column: 12 }, end: { line: 3, column: 13 } },
            }),
            createMutantResult({
              id: '2',
              mutatorName: 'BlockStatement',
              replacement: '{}',
              status: MutantStatus.Survived,
              location: { start: { line: 2, column: 20 }, end: { line: 4, column: 2 } },
            }),
          ],
          source: `
function add(a, b) {
  return a + b;
}
`,
        },
        'foo.js'
      );
      sut.element.model = input;
      await sut.whenStable();
    });

    it('should show a diff when selecting on the mutant-dot', async () => {
      // Arrange
      const mutantDot = sut.$<SVGElement>('.mutant-dot[mutant-id="2"]');
      const tr = mutantDot.closest('tr')!;

      // Act
      mutantDot.dispatchEvent(new Event('click', { bubbles: true }));
      await sut.whenStable();

      // Assert
      const diff = sut.$<HTMLTableRowElement>('tr.diff-new td.code');
      expect(tr.nextElementSibling!.nextElementSibling!.nextElementSibling!.querySelector('.diff-new td.code')).eq(diff);
      expect([...tr.classList]).contains('diff-old');
      expect([...tr.nextElementSibling!.classList]).contains('diff-old');
      expect([...tr.nextElementSibling!.nextElementSibling!.classList]).contains('diff-old');
      expect(diff.innerText).eq('function add(a, b) {}');
      expect(diff.querySelector('.diff-focus')!.innerHTML).eq('{');
    });

    it('should emit a mutantSelected selecting on the mutant-dot', async () => {
      // Act
      const event = await sut.catchCustomEvent(
        'mutant-selected',
        () => void sut.$('.mutant-dot[mutant-id="2"]').dispatchEvent(new Event('click', { bubbles: true }))
      );

      // Assert
      expect(event).ok;
      expect(event!.detail.mutant!.id).eq('2');
      expect(event!.detail.selected).eq(true);
    });

    it('should emit a mutantSelected with selected = false when deselecting a mutant-dot', async () => {
      // Arrange
      const mutantDot = sut.$('.mutant-dot[mutant-id="2"]');
      await sut.catchCustomEvent('mutant-selected', () => void mutantDot.dispatchEvent(new Event('click', { bubbles: true })));

      // Act
      const event = await sut.catchCustomEvent('mutant-selected', () => void mutantDot.dispatchEvent(new Event('click', { bubbles: true })));

      // Assert
      expect(event).ok;
      expect(event!.detail.mutant!.id).eq('2');
      expect(event!.detail.selected).eq(false);
    });

    it('should remove a diff when deselecting on the mutant-dot', async () => {
      // Arrange
      const mutantDot = sut.$<SVGElement>('.mutant-dot[mutant-id="2"]');
      const tr = mutantDot.closest('tr')!;
      mutantDot.dispatchEvent(new Event('click', { bubbles: true }));
      await sut.whenStable();

      // Act
      mutantDot.dispatchEvent(new Event('click', { bubbles: true }));
      await sut.whenStable();

      // Assert
      expect(sut.$<HTMLTableRowElement>('tr.diff-new td.code')).null;
      expect([...tr.classList]).not.contains('diff-old');
    });

    it('should show the diff when selecting the mutant inline', async () => {
      // Arrange
      const mutant = sut.$<HTMLSpanElement>('span.mutant[mutant-id="1"]');

      // Act
      mutant.click();
      await sut.whenStable();

      // Assert
      expect(sut.$<HTMLTableRowElement>('tr.diff-new td.code').innerText.trim()).eq('return a - b;');
    });
    it('should show the next diff when selecting mutant inline when another mutant is in scope', async () => {
      // Arrange
      const mutant = sut.$<HTMLSpanElement>('span.mutant[mutant-id="1"]');
      mutant.click();
      await sut.whenStable();

      // Act
      mutant.click();
      await sut.whenStable();

      // Assert
      expect(sut.$<HTMLTableRowElement>('tr.diff-new td.code').innerText.trim()).eq('function add(a, b) {}');
    });
    it('should deselect the mutant when selecting mutant inline when it is the last mutant in scope', async () => {
      // Arrange
      const mutant = sut.$<HTMLSpanElement>('span.mutant[mutant-id="1"]');
      mutant.click();
      await sut.whenStable();
      mutant.click();
      await sut.whenStable();

      // Act
      mutant.click();
      await sut.whenStable();

      // Assert
      expect(sut.$<HTMLTableRowElement>('tr.diff-new td.code')).null;
    });
  });
});
