import { expect } from 'chai';
import { FileUnderTestModel, MutantModel, TestModel } from 'mutation-testing-metrics';
import { MutantResult } from 'mutation-testing-report-schema';
import { MutationTestReportDrawerTestComponent } from '../../../src/components/mutation-test-report-drawer-test/mutation-test-report-drawer-test.component';
import { MutationTestReportDrawer } from '../../../src/components/mutation-test-report-drawer/mutation-test-report-drawer.component';
import { createFileResult, createLocation, createMutantResult, createTestDefinition } from '../../helpers/factory';
import { CustomElementFixture } from '../helpers/CustomElementFixture';

function createMutantModel(overrides?: Partial<MutantResult> & { mutatedLines?: string }): MutantModel {
  const mutant = new MutantModel(createMutantResult(overrides));
  mutant.sourceFile = new FileUnderTestModel(createFileResult(), 'foo.js');
  const mutatedLines = overrides?.mutatedLines;
  if (mutatedLines) {
    mutant.getMutatedLines = () => mutatedLines;
  }
  return mutant;
}

describe(MutationTestReportDrawerTestComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportDrawerTestComponent>;

  beforeEach(async () => {
    sut = new CustomElementFixture('mutation-test-report-drawer-test');
    await sut.whenStable();
  });
  afterEach(() => {
    sut.dispose();
  });

  it('should render a closed drawer by default', () => {
    const drawer = selectDrawer();
    expect(drawer.mode).eq('closed');
    expect(drawer.hasDetail).false;
  });

  describe('with a test', () => {
    let test: TestModel;
    beforeEach(() => {
      test = new TestModel(
        createTestDefinition({
          id: 'spec-1',
          location: createLocation({ start: { column: 1, line: 2 } }),
          name: 'foo should bar',
        })
      );
    });

    it('should render the header correctly', async () => {
      sut.element.test = test;
      await sut.whenStable();
      const headerText = sut.$('[slot="header"]').textContent;
      expect(headerText).match(/\s*spec-1\s*🌧\s*foo should bar\s*\[NotCovering\]\s*\(2:1\)\s*/);
    });

    it('should render closed by default', () => {
      expect(selectDrawer().mode).eq('closed');
    });

    describe('in the summary', () => {
      it('should be empty by default', async () => {
        sut.element.test = test;
        await sut.whenStable();
        expect(summaryText()).eq('');
      });

      it('should render the first killed mutant', async () => {
        const mutantModel = createMutantModel({ location: createLocation({ start: { line: 1, column: 5 } }) });
        mutantModel.getMutatedLines = () => '"Foo was here"';
        test.addKilled(mutantModel);
        sut.element.test = test;
        await sut.whenStable();
        expect(summaryText()).contain('🎯 Killed: 1 "Foo was here" (foo.js:1:5)');
      });

      it('should mention more killed mutants when they exist', async () => {
        test.addKilled(createMutantModel());
        test.addKilled(createMutantModel());
        sut.element.test = test;
        await sut.whenStable();
        expect(summaryText()).contain('(and 1 more)');
      });

      it("should mention when one only covering that it didn't kill any of them", async () => {
        test.addCovered(createMutantModel());
        sut.element.test = test;
        await sut.whenStable();
        const summary = summaryText();
        expect(summary).contains('☂️ Covered 1 mutant');
        expect(summary).not.contains('1 mutants'); // not plural
        expect(summary).contains("(yet didn't kill any of them)");
      });

      it("should not mention that it didn't kill any of them when in fact it had killed a mutant", async () => {
        test.addCovered(createMutantModel());
        test.addKilled(createMutantModel());
        sut.element.test = test;
        await sut.whenStable();
        const summary = summaryText();
        expect(summary).not.contains("(yet didn't kill any of them)");
      });

      it('should mention when covered 2 mutants', async () => {
        test.addCovered(createMutantModel());
        test.addCovered(createMutantModel());
        sut.element.test = test;
        await sut.whenStable();
        const summary = summaryText();
        expect(summary).contains('☂️ Covered 2 mutants');
      });

      function summaryText() {
        return sut.$('[slot="summary"]').innerText;
      }
    });

    describe('in the detail', () => {
      it('should not render by default', async () => {
        sut.element.test = test;
        await sut.whenStable();
        expect(detailText()).match(/^\s*$/);
      });

      it('should render the mutants', async () => {
        const mutant1 = createMutantModel({ id: '1', mutatedLines: 'const a = false' });
        const mutant2 = createMutantModel({ id: '2', mutatedLines: 'const b = true' });
        test.addKilled(mutant1);
        test.addKilled(mutant2);
        test.addCovered(mutant1);
        test.addCovered(mutant2);
        test.addCovered(createMutantModel({ id: '3', mutatedLines: 'if(1 <= 5)' }));
        sut.element.test = test;
        await sut.whenStable();
        const listItems = sut.$$('[slot="detail"] ul li');
        expect(listItems).lengthOf(3);
        expect(listItems[0].textContent).contains('🎯 1 const a = false');
        expect(listItems[1].textContent).contains('🎯 2 const b = true');
        expect(listItems[2].textContent).contains('☂️ 3 if(1 <= 5)');
      });

      function detailText() {
        return sut.$('[slot="detail"]').innerText;
      }
    });
  });

  function selectDrawer() {
    return sut.$('mutation-test-report-drawer') as MutationTestReportDrawer;
  }
});
