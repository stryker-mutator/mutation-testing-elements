import { expect } from 'chai';
import { MutantModel, TestFileModel } from 'mutation-testing-metrics';
import { TestStatus } from 'mutation-testing-metrics';
import {
  MutationTestReportFileStateFilterComponent,
  StateFilter,
} from '../../../src/components/mutation-test-report-state-filter/mutation-test-report-state-filter.component';
import { MutationTestReportTestFile } from '../../../src/components/mutation-test-report-test-file/mutation-test-report-test-file.component';
import { MutationTestReportTestListItemComponent } from '../../../src/components/mutation-test-report-test-list-item/mutation-test-report-test-list-item.component';
import { MutationTestReportTestComponent } from '../../../src/components/mutation-test-report-test/mutation-test-report-test.component';
import { createCustomEvent } from '../../../src/lib/custom-events';
import { createMutantResult, createStateFilter, createTestDefinition } from '../../helpers/factory';
import { CustomElementFixture } from '../helpers/CustomElementFixture';

describe(MutationTestReportTestFile.name, () => {
  let sut: CustomElementFixture<MutationTestReportTestFile>;

  beforeEach(() => {
    sut = new CustomElementFixture('mutation-test-report-test-file');
  });

  function selectStateFilter(): MutationTestReportFileStateFilterComponent<TestStatus> {
    return sut.$('mutation-test-report-state-filter') as MutationTestReportFileStateFilterComponent<TestStatus>;
  }

  function selectTestListItems(): MutationTestReportTestListItemComponent[] {
    return sut.$$('mutation-test-report-test-list-item') as MutationTestReportTestListItemComponent[];
  }
  function selectTests(): MutationTestReportTestComponent[] {
    return sut.$$('mutation-test-report-test') as MutationTestReportTestComponent[];
  }

  describe('state filter', () => {
    it('should provide filters with correct emoji, context and count', async () => {
      // Arrange
      const model = new TestFileModel(
        {
          tests: [
            createTestDefinition({ id: 'test-1' }),
            createTestDefinition({ id: 'test-2' }),
            createTestDefinition({ id: 'test-3' }),
            createTestDefinition({ id: 'test-4' }),
          ],
        },
        'foo.spec.js'
      );
      // test-1, test-2: Killing
      model.tests[0].addKilled(new MutantModel(createMutantResult()));
      model.tests[1].addKilled(new MutantModel(createMutantResult()));
      // test-3: NotKilling
      model.tests[2].addCovered(new MutantModel(createMutantResult()));
      // test-4 is NotCovering

      // Act
      sut.element.model = model;
      await sut.whenStable();

      // Assert
      const expectedFilters: StateFilter<TestStatus>[] = [
        { enabled: true, count: 2, status: TestStatus.Killing, label: '✅ Killing', context: 'success' },
        { enabled: true, count: 1, status: TestStatus.NotKilling, label: '🕊 NotKilling', context: 'warning' },
        { enabled: true, count: 1, status: TestStatus.NotCovering, label: '🌧 NotCovering', context: 'danger' },
      ];
      expect(selectStateFilter().filters).deep.eq(expectedFilters);
    });

    it('should not provide filters for which there are no tests', async () => {
      // Arrange
      const model = new TestFileModel(
        {
          tests: [
            createTestDefinition({ id: 'test-1' }),
            createTestDefinition({ id: 'test-2' }),
            createTestDefinition({ id: 'test-3' }),
            createTestDefinition({ id: 'test-4' }),
          ],
        },
        'foo.spec.js'
      );

      // Act
      sut.element.model = model;
      await sut.whenStable();

      // Assert
      const expectedFilters: StateFilter<TestStatus>[] = [
        { enabled: true, count: 4, status: TestStatus.NotCovering, label: '🌧 NotCovering', context: 'danger' },
      ];
      expect(selectStateFilter().filters).deep.eq(expectedFilters);
    });

    it('should filter correct tests ⚡ onFiltersChanged', async () => {
      // Arrange
      const model = new TestFileModel(
        {
          tests: [
            createTestDefinition({ id: 'test-1', location: { start: { line: 1, column: 1 } } }) /* Test shown in source */,
            createTestDefinition({ id: 'test-2', location: undefined }) /* Test shown in list */,
          ],
          source: 'it("foo should be bar") { \n}\n',
        },
        'foo.spec.js'
      );
      sut.element.model = model;
      await sut.whenStable();

      // Act
      const eventDetail: StateFilter<TestStatus>[] = [
        { enabled: false, count: 4, status: TestStatus.NotCovering, label: '❌ NotCovering', context: 'danger' },
      ];
      selectStateFilter().dispatchEvent(createCustomEvent('filters-changed', eventDetail));
      await sut.whenStable();

      // Assert
      expect(selectTestListItems()[0].show).false;
      expect(selectTests()[0].show).false;
    });
  });

  describe('code', () => {
    it("shouldn't display the code if there is none", async () => {
      const model = new TestFileModel(
        {
          tests: [],
        },
        'foo.spec.js'
      );
      sut.element.model = model;
      await sut.whenStable();
      expect(sut.$('code')).null;
    });

    it('should highlight the code', async () => {
      const model = new TestFileModel(
        {
          tests: [],
          source: `it('should foo into bar');`,
        },
        'foo.spec.js'
      );
      sut.element.model = model;
      await sut.whenStable();
      expect(sut.$('code .token')).ok;
    });
  });

  describe('with `mutation-test-report-test`', () => {
    let testComponents: MutationTestReportTestComponent[];
    let filterComponent: MutationTestReportFileStateFilterComponent<TestStatus>;

    beforeEach(async () => {
      const model = new TestFileModel(
        {
          tests: [
            createTestDefinition({ id: '1', location: { start: { line: 1, column: 3 } }, name: 'should foo into bar' }),
            createTestDefinition({ id: '2', location: { start: { line: 5, column: 3 } }, name: 'should baz into qux' }),
          ],
          source: `it('should foo into bar', () => {\nexpect(bar).includes('foo');\n});\n\nit('should baz into qux', () => {\nexpect(baz).includes('qux');\n});\n\n`,
        },
        'foo.spec.js'
      );
      model.tests[0].addKilled(new MutantModel(createMutantResult()));
      sut.element.model = model;
      await sut.whenStable();
      testComponents = sut.$$('mutation-test-report-test') as MutationTestReportTestComponent[];
      filterComponent = sut.$('mutation-test-report-state-filter') as MutationTestReportFileStateFilterComponent<TestStatus>;
    });

    it('should bind the tests to the components', () => {
      expect(testComponents[0].test).eq(sut.element.model!.tests[0]);
      expect(testComponents[1].test).eq(sut.element.model!.tests[1]);
    });

    it('should show the tests by default', () => {
      testComponents.forEach((testComponent) => {
        expect(testComponent.show).true;
      });
    });

    it('should hide the "Killing" tests when "Killing" tests are filtered out', async () => {
      const filters: StateFilter<TestStatus>[] = [
        createStateFilter(TestStatus.Killing, { enabled: false }),
        createStateFilter(TestStatus.NotCovering, { enabled: true }),
      ];
      filterComponent.dispatchEvent(createCustomEvent('filters-changed', filters));
      await sut.whenStable();
      expect(testComponents[0].show).false;
      expect(testComponents[1].show).true;
    });
  });
});
