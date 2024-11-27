import { MutantModel, TestModel } from 'mutation-testing-metrics';

import type { MutationTestReportDrawer } from '../../../src/components/drawer/drawer.component.js';
import { MutationTestReportDrawerMutant } from '../../../src/components/drawer-mutant/drawer-mutant.component.js';
import { CustomElementFixture } from '../helpers/CustomElementFixture.js';
import { createLocation, createMutantResult, createTestDefinition } from '../helpers/factory.js';

describe(MutationTestReportDrawerMutant.name, () => {
  let sut: CustomElementFixture<MutationTestReportDrawerMutant>;

  beforeEach(async () => {
    sut = new CustomElementFixture('mte-drawer-mutant');
    await sut.whenStable();
  });
  afterEach(() => {
    sut.dispose();
  });

  it('should render a closed drawer even without a mutant', () => {
    const drawer = selectDrawer();
    expect(drawer.mode).eq('closed');
    expect(drawer.hasDetail).false;
  });

  describe('with a mutant', () => {
    let mutant: MutantModel;
    beforeEach(() => {
      mutant = new MutantModel(
        createMutantResult({
          id: 'mut-1',
          location: createLocation({ start: { column: 1, line: 2 } }),
          mutatorName: 'fooMutator',
          status: 'Survived',
        }),
      );
    });

    it('should render the header correctly', async () => {
      sut.element.mutant = mutant;
      await sut.whenStable();
      const headerText = sut.$('[slot="header"]').textContent;
      expect(headerText).match(/👽\s*fooMutator\s*Survived\s*\(2:1\)\s*/);
      expect(selectDrawer().hasDetail).false;
    });

    it('should render closed by default', () => {
      expect(selectDrawer().mode).eq('closed');
    });

    describe('in the summary', () => {
      it('should be empty by default', async () => {
        sut.element.mutant = mutant;
        await sut.whenStable();
        expect(summaryText()).eq('');
        expect(selectDrawer().hasDetail).false;
      });

      it('should render the first killedBy test', async () => {
        mutant.killedByTests = [new TestModel(createTestDefinition({ name: 'foo should bar' }))];
        sut.element.mutant = mutant;
        await sut.whenStable();
        expect(summaryText()).contain('🎯 Killed by: foo should bar');
        expect(selectDrawer().hasDetail).true;
      });

      it('should mention more killedBy tests when they exist', async () => {
        mutant.killedByTests = [
          new TestModel(createTestDefinition({ id: '1', name: 'foo should bar' })),
          new TestModel(createTestDefinition({ id: '2' })),
        ];
        sut.element.mutant = mutant;
        await sut.whenStable();
        expect(summaryText()).contain('(and 1 more)');
      });

      it('should mention when one test covered the mutant', async () => {
        mutant.status = 'Killed';
        mutant.coveredByTests = [new TestModel(createTestDefinition())];
        sut.element.mutant = mutant;
        await sut.whenStable();
        const summary = summaryText();
        expect(summary).contains('☂️ Covered by 1 test');
        expect(summary).not.contains('by 1 tests'); // not plural
        expect(summary).not.contains('yet still survived');
        expect(selectDrawer().hasDetail).true;
      });

      it('should not mentioned that a killed mutant still survived', async () => {
        mutant.status = 'Killed';
        mutant.coveredByTests = [new TestModel(createTestDefinition())];
        sut.element.mutant = mutant;
        await sut.whenStable();
        const summary = summaryText();
        expect(summary).not.contains('yet still survived');
      });

      it('should mention when two tests covered the mutant', async () => {
        mutant.coveredByTests = [new TestModel(createTestDefinition({ id: '1' })), new TestModel(createTestDefinition({ id: '2' }))];
        sut.element.mutant = mutant;
        await sut.whenStable();
        const summary = summaryText();
        expect(summary).contains('☂️ Covered by 2 tests');
      });

      it('should contain the description', async () => {
        mutant.description = 'Replaced "foo" with "bar"';
        sut.element.mutant = mutant;
        await sut.whenStable();
        const summary = summaryText();
        expect(summary).contains('📖 Replaced "foo" with "bar"');
      });

      it('should contain the status reason', async () => {
        mutant.status = 'Timeout';
        mutant.statusReason = 'Hit limit reached (501 > 500)';
        sut.element.mutant = mutant;
        await sut.whenStable();
        const summary = summaryText();
        expect(summary).contains('🕵️ Hit limit reached (501 > 500)');
        expect(selectDrawer().hasDetail).true;
      });

      it('should not render the status reason when it is empty', async () => {
        mutant.status = 'Timeout';
        mutant.statusReason = '   ';
        sut.element.mutant = mutant;
        await sut.whenStable();
        const summary = summaryText();
        expect(summary).not.contains('🕵️');
      });

      function summaryText() {
        return sut.$<HTMLElement>('[slot="summary"]').innerText;
      }
    });

    describe('in the detail', () => {
      it('should not render by default', async () => {
        sut.element.mutant = mutant;
        await sut.whenStable();
        expect(detailText()).match(/^\s*$/);
      });

      it('should render the tests', async () => {
        const test1 = new TestModel(createTestDefinition({ id: '1', name: 'foo should bar' }));
        const test2 = new TestModel(createTestDefinition({ id: '2', name: 'baz should qux' }));
        mutant.killedByTests = [test1, test2];
        mutant.coveredByTests = [test1, test2, new TestModel(createTestDefinition({ id: '3', name: 'quux should corge' }))];
        sut.element.mutant = mutant;
        await sut.whenStable();
        const listItems = sut.$$('[slot="detail"] ul li');
        expect(listItems).lengthOf(3);
        expect(listItems[0]).toHaveTextContent('🎯 foo should bar');
        expect(listItems[1]).toHaveTextContent('🎯 baz should qux');
        expect(listItems[2]).toHaveTextContent('☂️ quux should corge');
      });

      function detailText() {
        return sut.$<HTMLElement>('[slot="detail"]').innerText;
      }
    });
  });

  function selectDrawer(): MutationTestReportDrawer {
    return sut.$('mte-drawer');
  }
});
