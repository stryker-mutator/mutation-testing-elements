import { FileUnderTestModel } from 'mutation-testing-metrics';
import type { FileResult, MutantResult, MutantStatus } from 'mutation-testing-report-schema/api';

import { FileComponent } from '../../../src/components/file/file.component.js';
import type { FileStateFilterComponent } from '../../../src/components/state-filter/state-filter.component.js';
import { createCustomEvent } from '../../../src/lib/custom-events.js';
import { CustomElementFixture } from '../helpers/CustomElementFixture.js';
import { createFileResult, createMutantResult } from '../helpers/factory.js';

describe(FileComponent.name, () => {
  let sut: CustomElementFixture<FileComponent>;
  let fileResult: FileResult;
  let filterComponent: FileStateFilterComponent<MutantStatus>;

  beforeEach(async () => {
    sut = new CustomElementFixture('mte-file', { autoConnect: false });
    fileResult = createFileResult();
    sut.element.model = new FileUnderTestModel(fileResult, 'foo.js');
    sut.connect();
    await sut.whenStable();
    filterComponent = sut.$('mte-state-filter');
  });

  afterEach(() => {
    sut.dispose();
  });

  it('should show the code', () => {
    expect(sut.$('code')).toHaveTextContent(fileResult.source);
  });

  it('should highlight the code', () => {
    expect(sut.$('code .token')).ok;
  });

  describe('with mutants', () => {
    it('should mark the mutants inside the code', async () => {
      // Arrange
      const fileResult = createFileResult({
        mutants: [
          createMutantResult({
            id: '1',
            replacement: '-',
            status: 'NoCoverage',
            mutatorName: 'ArithmeticOperator',
            location: { start: { line: 2, column: 12 }, end: { line: 2, column: 13 } },
          }),
          createMutantResult({
            id: '2',
            mutatorName: 'BlockStatement',
            replacement: '{}',
            status: 'Survived',
            location: { start: { line: 1, column: 20 }, end: { line: 4, column: 2 } },
          }),
        ],
        source: 'function add(a, b) {\n  return a + b;\n}',
      });

      // Act
      sut.element.model = new FileUnderTestModel(fileResult, 'foo.js');
      await sut.whenStable();

      // Assert
      expect(queryMutantText('1')).eq('+');
      expect(queryMutantText('2')).eq('{return a + b;}');
      expect(sut.$('.mutant[mutant-id="1"]').title).eq('ArithmeticOperator NoCoverage');
      expect(sut.$('.mutant[mutant-id="2"]').title).eq('BlockStatement Survived');
    });

    it('should escape html inside mutant attributes', async () => {
      // Arrange
      const fileResult = createFileResult({
        mutants: [
          createMutantResult({
            id: '"&test',
            replacement: '-',
            status: '"&test' as 'NoCoverage',
            mutatorName: 'ArithmeticOperator"&<script>alert</script>',
            location: { start: { line: 2, column: 12 }, end: { line: 2, column: 13 } },
          }),
        ],
        source: 'function add(a, b) {\n  return a + b;\n}',
      });

      // Act
      sut.element.model = new FileUnderTestModel(fileResult, 'foo.js');
      await sut.whenStable();

      // Assert
      const mutant = sut.$('.mutant');
      expect(mutant.getAttribute('mutant-id')).eq('"&test');
      expect(mutant.className).eq('mutant border-none "&test');
      expect(mutant.title).eq('ArithmeticOperator"&<script>alert</script> "&test');
    });

    it('should hide the mutant-dot if it is filtered', async () => {
      // Arrange
      const fileResult = createFileResult({
        mutants: [createMutantResult({ status: 'Survived', location: { start: { line: 1, column: 1 }, end: { line: 1, column: 6 } } })],
        source: 'foo + bar',
      });
      sut.element.model = new FileUnderTestModel(fileResult, 'foo.js');
      await sut.whenStable();
      expect(sut.$$('.mutant-dot')).lengthOf(1);
      await sut.whenStable();

      // Act
      filterComponent.dispatchEvent(createCustomEvent('filters-changed', []));
      await sut.whenStable();

      // Assert
      expect(sut.$$('.mutant-dot')).lengthOf(0);
    });

    it('should sort the mutants based on location', async () => {
      // Arrange
      const fileResult = createFileResult({
        mutants: [
          createMutantResult({ id: '1', status: 'Survived', location: { start: { line: 2, column: 1 }, end: { line: 1, column: 6 } } }),
          createMutantResult({ id: '2', status: 'Survived', location: { start: { line: 1, column: 2 }, end: { line: 1, column: 3 } } }),
          createMutantResult({ id: '3', status: 'Survived', location: { start: { line: 1, column: 1 }, end: { line: 1, column: 4 } } }),
        ],
        source: 'foo + bar\nfoo + bar',
      });
      filterComponent.dispatchEvent(createCustomEvent('filters-changed', ['Survived']));

      // Act
      sut.element.model = new FileUnderTestModel(fileResult, 'foo.js');
      await sut.whenStable();

      // Assert
      const mutantIds = [...sut.$$('.mutant-dot')].map((mutantDot) => mutantDot.getAttribute('mutant-id'));
      expect(mutantIds).deep.eq(['3', '2', '1']);
    });

    it('should insert mutant-dot elements at the end of the line', async () => {
      const input = new FileUnderTestModel(
        {
          language: 'javascript',
          mutants: [
            createMutantResult({
              id: '1',
              location: { end: { column: 13, line: 3 }, start: { column: 10, line: 3 } },
              mutatorName: 'MethodReplacement',
              status: 'NoCoverage',
            }),
            createMutantResult({
              id: '2',
              location: { end: { column: 999 /*Doesn't exist*/, line: 4 }, start: { column: 15, line: 4 } },
              mutatorName: 'SemicolonRemover',
              status: 'Survived',
            }),
            createMutantResult({
              id: '3',
              location: { end: { column: 1, line: 9999 /*Doesn't exist*/ }, start: { column: 15, line: 9999 } },
              mutatorName: 'SemicolonRemover',
              replacement: '',
              status: 'Survived',
            }),
          ],

          source: `const foo = 'bar';

function add(a, b) {
  return a + b;
}`,
        },
        'foo.js',
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

    it('should add a title to mutant-dot elements', async () => {
      const input = new FileUnderTestModel(
        {
          language: 'javascript',
          mutants: [
            createMutantResult({
              location: { end: { column: 13, line: 1 }, start: { column: 10, line: 1 } },
              mutatorName: 'MethodReplacement',
              status: 'NoCoverage',
            }),
          ],
          source: 'const foo = "bar";',
        },
        'foo.js',
      );
      sut.element.model = input;
      await sut.whenStable();
      const title = sut.$('svg[mutant-id] title').textContent;
      expect(title).eq('MethodReplacement NoCoverage');
    });

    it('should report mutant status correctly', async () => {
      // Arrange
      const allStates: MutantStatus[] = ['CompileError', 'Ignored', 'Killed', 'NoCoverage', 'RuntimeError', 'Survived', 'Timeout'];
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
        'foo.js',
      );
      sut.element.model = input;
      filterComponent.dispatchEvent(createCustomEvent('filters-changed', allStates));

      // Act
      await sut.whenStable();

      // Assert
      allStates.forEach((status) => {
        const mutant = sut.$(`code span.mutant.${status}`);
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
              status: 'NoCoverage',
              mutatorName: 'ArithmeticOperator',
              location: { start: { line: 3, column: 12 }, end: { line: 3, column: 13 } },
            }),
            createMutantResult({
              id: '2',
              mutatorName: 'BlockStatement',
              replacement: '{}',
              status: 'Survived',
              location: { start: { line: 2, column: 20 }, end: { line: 4, column: 2 } },
            }),
          ],
          source: `
function add(a, b) {
  return a + b;
}
`,
        },
        'foo.js',
      );
      sut.element.model = input;
      await sut.whenStable();
    });

    describe('using the mutant dots', () => {
      it('should show a diff', async () => {
        // Arrange
        const mutantDot = sut.$<SVGElement>('.mutant-dot[mutant-id="2"]');
        const tr = mutantDot.closest('tr')!;

        // Act
        mutantDot.dispatchEvent(new Event('click', { bubbles: true }));
        await sut.whenStable();

        // Assert
        const diff = sut.$('tr.diff-new td.code');
        expect(tr.nextElementSibling!.nextElementSibling!.nextElementSibling!.querySelector('.diff-new td.code')).eq(diff);
        expect([...tr.classList]).contains('diff-old');
        expect([...tr.nextElementSibling!.classList]).contains('diff-old');
        expect([...tr.nextElementSibling!.nextElementSibling!.classList]).contains('diff-old');
        expect(diff.innerText).eq('function add(a, b) {}');
        const focus = [...diff.querySelectorAll('.diff-focus')].map((el) => el.textContent).join('');
        expect(focus).eq('{}');
      });

      it('should add the correct focus in the mutated part', async () => {
        // Arrange
        const mutantDot = sut.$<SVGElement>('.mutant-dot[mutant-id="1"]');

        // Act
        mutantDot.dispatchEvent(new Event('click', { bubbles: true }));
        await sut.whenStable();

        // Assert
        const diff = sut.$('tr.diff-new td.code');
        const focus = [...diff.querySelectorAll('.diff-focus')].map((el) => el.textContent).join('');
        expect(focus).eq('-');
      });

      it('should emit a mutantSelected', async () => {
        // Act
        const event = await sut.catchCustomEvent(
          'mutant-selected',
          () => void sut.$('.mutant-dot[mutant-id="2"]').dispatchEvent(new Event('click', { bubbles: true })),
        );

        // Assert
        expect(event).ok;
        expect(event!.detail.mutant!.id).eq('2');
        expect(event!.detail.selected).eq(true);
      });

      it('should emit a mutantSelected with selected = false when deselecting', async () => {
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

      it('should remove a diff when deselecting', async () => {
        // Arrange
        const mutantDot = sut.$<SVGElement>('.mutant-dot[mutant-id="2"]');
        const tr = mutantDot.closest('tr')!;
        mutantDot.dispatchEvent(new Event('click', { bubbles: true }));
        await sut.whenStable();

        // Act
        mutantDot.dispatchEvent(new Event('click', { bubbles: true }));
        await sut.whenStable();

        // Assert
        expect(sut.$('tr.diff-new td.code')).null;
        expect([...tr.classList]).not.contains('diff-old');
      });

      it('should deselect the mutant when on filterChanged and filtered out', async () => {
        // Arrange
        const mutant = sut.$<SVGElement>('svg[mutant-id="1"]');
        mutant.dispatchEvent(new Event('click', { bubbles: true }));
        await sut.whenStable();

        // Act
        filterComponent.dispatchEvent(createCustomEvent('filters-changed', ['Survived'])); // Deselect "NoCoverage"
        await sut.whenStable();

        // Assert
        expect(sut.$('tr.diff-new td.code')).null;
      });
    });

    describe('by clicking on the code directly', () => {
      it('should show the diff', async () => {
        // Arrange
        const mutant = sut.$('span.mutant[mutant-id="1"]');

        // Act
        mutant.click();
        await sut.whenStable();

        // Assert
        expect(sut.$('tr.diff-new td.code').innerText.trim()).eq('return a - b;');
      });

      it('should not show the diff if the mutant was filtered out', async () => {
        // Arrange
        filterComponent.dispatchEvent(createCustomEvent('filters-changed', ['Survived']));
        await sut.whenStable();
        const mutant = sut.$('span.mutant[mutant-id="1"]');

        // Act
        mutant.click();
        await sut.whenStable();

        // Assert
        expect(sut.$('tr.diff-new td.code').innerText).eq('function add(a, b) {}'); // mutant 1 is filtered out, mutant 2 should be shown
      });

      it('should not change anything when clicking somewhere else in the code', async () => {
        // Act
        sut.$('code').click();
        await sut.whenStable();

        // Assert
        expect(sut.$('tr.diff-new td.code')).null;
      });

      it('should clear the selection', async () => {
        // Arrange
        const getSelectionStub = vi.spyOn(window, 'getSelection');
        const selectionMock = { removeAllRanges: vi.fn() };
        getSelectionStub.mockReturnValue(selectionMock as unknown as Selection);
        const mutant = sut.$('span.mutant[mutant-id="1"]');

        // Act
        mutant.click();
        await sut.whenStable();

        // Assert
        expect(selectionMock.removeAllRanges).toHaveBeenCalledOnce();
      });

      it('should prevent propagation', async () => {
        // Act
        const click = await sut.catchNativeEvent('click', () => {
          sut.$('code').click();
        });

        // Assert
        expect(click).undefined;
      });

      it('should show the next diff when another mutant is in scope', async () => {
        // Arrange
        const mutant = sut.$('span.mutant[mutant-id="1"]');
        mutant.click();
        await sut.whenStable();

        // Act
        mutant.click();
        await sut.whenStable();

        // Assert
        expect(sut.$('tr.diff-new td.code').innerText.trim()).eq('function add(a, b) {}');
      });

      it('should deselect the mutant when it is the last mutant in scope', async () => {
        // Arrange
        const mutant = sut.$('span.mutant[mutant-id="1"]');
        mutant.click();
        await sut.whenStable();
        mutant.click();
        await sut.whenStable();

        // Act
        mutant.click();
        await sut.whenStable();

        // Assert
        expect(sut.$('tr.diff-new td.code')).null;
      });

      // Should not be, but Stryker.NET for example used mutant ids as numbers in the past
      it('should support non-string mutant ids', async () => {
        // Arrange
        // @ts-expect-error should be a string, but this test is to see what happens when the id is a number
        sut.element.model.mutants[0].id = 1;

        // Act
        const mutant = sut.$('span.mutant[mutant-id="1"]');
        mutant.click();
        await sut.whenStable();

        // Assert
        expect(sut.$('tr.diff-new td.code').innerText.trim()).eq('return a - b;');
      });

      it('should not update state in file when model is updated', async () => {
        // Arrange
        sut.element.model.mutants[0].status = 'Killed';
        filterComponent.dispatchEvent(createCustomEvent('filters-changed', ['Killed']));
        const mutant = sut.$('span.mutant[mutant-id="1"]');
        mutant.click();
        sut.element.requestUpdate('model');
        await sut.whenStable();

        // Act
        sut.element.model.mutants[0].status = 'Killed';
        sut.element.requestUpdate('model');
        await sut.whenStable();

        // Assert
        expect(sut.$('tr.diff-new td.code').innerText.trim()).eq('return a - b;');
      });
    });

    describe('next', () => {
      it('should select the first mutant', async () => {
        // Act
        filterComponent.dispatchEvent(createCustomEvent('next', undefined));
        await sut.whenStable();

        // Assert
        const selectedMutants = sut.$$('.mutant-dot.selected');
        expect(selectedMutants).lengthOf(1);
        expect(selectedMutants[0].getAttribute('mutant-id')).eq('2');
      });

      it('should select the second mutant when the first mutant is selected', async () => {
        // Arrange
        sut.$<SVGElement>('.mutant-dot[mutant-id="2"]').dispatchEvent(new Event('click', { bubbles: true }));
        await sut.whenStable();

        // Act
        filterComponent.dispatchEvent(createCustomEvent('next', undefined));
        await sut.whenStable();

        // Assert
        const selectedMutants = sut.$$('.mutant-dot.selected');
        expect(selectedMutants).lengthOf(1);
        expect(selectedMutants[0].getAttribute('mutant-id')).eq('1');
      });

      it('should select the first mutant when the last mutant is selected', async () => {
        // Arrange
        sut.$<SVGElement>('.mutant-dot[mutant-id="1"]').dispatchEvent(new Event('click', { bubbles: true }));
        await sut.whenStable();

        // Act
        filterComponent.dispatchEvent(createCustomEvent('next', undefined));
        await sut.whenStable();

        // Assert
        const selectedMutants = sut.$$('.mutant-dot.selected');
        expect(selectedMutants).lengthOf(1);
        expect(selectedMutants[0].getAttribute('mutant-id')).eq('2');
      });

      it('should not do anything when there are no mutants', async () => {
        // Arrange
        filterComponent.dispatchEvent(createCustomEvent('filters-changed', [])); // deselect all states
        await sut.whenStable();

        // Act
        filterComponent.dispatchEvent(createCustomEvent('next', undefined));
        await sut.whenStable();

        // Assert
        const selectedMutants = sut.$$('.mutant-dot.selected');
        expect(selectedMutants).lengthOf(0);
      });
    });

    describe('previous', () => {
      it('should select the last mutant', async () => {
        // Act
        filterComponent.dispatchEvent(createCustomEvent('previous', undefined));
        await sut.whenStable();

        // Assert
        const selectedMutants = sut.$$('.mutant-dot.selected');
        expect(selectedMutants).lengthOf(1);
        expect(selectedMutants[0].getAttribute('mutant-id')).eq('1');
      });

      it('should select the second mutant when the first mutant is selected', async () => {
        // Arrange
        sut.$<SVGElement>('.mutant-dot[mutant-id="2"]').dispatchEvent(new Event('click', { bubbles: true }));
        await sut.whenStable();

        // Act
        filterComponent.dispatchEvent(createCustomEvent('previous', undefined));
        await sut.whenStable();

        // Assert
        const selectedMutants = sut.$$('.mutant-dot.selected');
        expect(selectedMutants).lengthOf(1);
        expect(selectedMutants[0].getAttribute('mutant-id')).eq('1');
      });

      it('should select the first mutant when the last mutant is selected', async () => {
        // Arrange
        sut.$<SVGElement>('.mutant-dot[mutant-id="1"]').dispatchEvent(new Event('click', { bubbles: true }));
        await sut.whenStable();

        // Act
        filterComponent.dispatchEvent(createCustomEvent('previous', undefined));
        await sut.whenStable();

        // Assert
        const selectedMutants = sut.$$('.mutant-dot.selected');
        expect(selectedMutants).lengthOf(1);
        expect(selectedMutants[0].getAttribute('mutant-id')).eq('2');
      });

      it('should not do anything when there are no mutants', async () => {
        // Arrange
        filterComponent.dispatchEvent(createCustomEvent('filters-changed', [])); // deselect all states
        await sut.whenStable();

        // Act
        filterComponent.dispatchEvent(createCustomEvent('previous', undefined));
        await sut.whenStable();

        // Assert
        const selectedMutants = sut.$$('.mutant-dot.selected');
        expect(selectedMutants).lengthOf(0);
      });
    });
  });

  function queryMutantText(mutantId: string) {
    return [...sut.$$(`.mutant[mutant-id="${mutantId}"]`)].map((mutant) => mutant.innerText).join('');
  }
});
