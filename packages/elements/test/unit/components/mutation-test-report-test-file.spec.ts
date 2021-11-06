import { expect } from 'chai';
import { MutantModel, TestFileModel } from 'mutation-testing-metrics';
import { TestStatus } from 'mutation-testing-metrics';
import { FileStateFilterComponent, StateFilter } from '../../../src/components/state-filter/state-filter.component';
import { TestFileComponent } from '../../../src/components/test-file/test-file.component';
import { createCustomEvent } from '../../../src/lib/custom-events';
import { createMutantResult, createStateFilter, createTestDefinition } from '../../helpers/factory';
import { CustomElementFixture } from '../helpers/CustomElementFixture';

describe(TestFileComponent.name, () => {
  let sut: CustomElementFixture<TestFileComponent>;

  beforeEach(() => {
    sut = new CustomElementFixture('mte-test-file');
  });

  function selectStateFilter(): FileStateFilterComponent<TestStatus> {
    return sut.$('mte-state-filter') as FileStateFilterComponent<TestStatus>;
  }

  function selectTestListItems(): HTMLLIElement[] {
    return sut.$$('.list-group-item');
  }
  function selectTests(): HTMLSpanElement[] {
    return sut.$$('.test-dot');
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
      // test-3: Covering
      model.tests[2].addCovered(new MutantModel(createMutantResult()));
      // test-4 is NotCovering

      // Act
      sut.element.model = model;
      await sut.whenStable();

      // Assert
      const expectedFilters: StateFilter<TestStatus>[] = [
        { enabled: true, count: 2, status: TestStatus.Killing, label: '✅ Killing', context: 'success' },
        { enabled: true, count: 1, status: TestStatus.Covering, label: '☂ Covering', context: 'warning' },
        { enabled: true, count: 1, status: TestStatus.NotCovering, label: '🌧 NotCovering', context: 'caution' },
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
        { enabled: true, count: 4, status: TestStatus.NotCovering, label: '🌧 NotCovering', context: 'caution' },
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
        { enabled: false, count: 4, status: TestStatus.NotCovering, label: '🌧 NotCovering', context: 'caution' },
      ];
      selectStateFilter().dispatchEvent(createCustomEvent('filters-changed', eventDetail));
      await sut.whenStable();

      // Assert
      expect(selectTests()).lengthOf(0);
      expect(selectTestListItems()).lengthOf(0);
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

    it('should insert test-dot elements at the end of the lines', async () => {
      const model = new TestFileModel(
        {
          tests: [createTestDefinition({ id: 'spec-1', location: { start: { line: 2, column: 3 } } })],
          source: '\nit("should work", () => {})',
        },
        'foo.spec.js'
      );
      sut.element.model = model;
      await sut.whenStable();

      expect(sut.$('code tr.line:nth-child(2) .code').innerHTML).contains(
        '<svg height="10" width="10" test-id="spec-1" class="test-dot NotCovering">'
      );
    });

    it('should add the test title to the svg', async () => {
      const model = new TestFileModel(
        {
          tests: [createTestDefinition({ id: 'spec-1', location: { start: { line: 2, column: 3 } } })],
          source: '\nit("should work", () => {})',
        },
        'foo.spec.js'
      );
      sut.element.model = model;
      await sut.whenStable();

      expect(sut.$('code tr.line:nth-child(2) .code').innerHTML).match(/<title>(<!--.+-->)?foo should bar \(NotCovering\)<\/title>/);
    });

    it('should place remaining tests at the end', async () => {
      // line 3 doesn't exist
      const model = new TestFileModel(
        {
          tests: [createTestDefinition({ id: 'spec-1', location: { start: { line: 3, column: 1 } } })],
          source: '  it("foo")\n  it("bar")',
        },
        'foo.spec.js'
      );
      sut.element.model = model;
      await sut.whenStable();

      expect(sut.$('code tr.line:nth-child(2) .code').innerHTML).include('test-id="spec-1"');
    });
  });

  describe('with tests', () => {
    let filterComponent: FileStateFilterComponent<TestStatus>;

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
      filterComponent = sut.$('mte-state-filter') as FileStateFilterComponent<TestStatus>;
    });

    it('should set the test-id attribute', () => {
      const tests = sut.$$<HTMLSpanElement>('.test-dot');
      expect(tests[0].getAttribute('test-id')).eq('1');
      expect(tests[1].getAttribute('test-id')).eq('2');
    });

    it('should hide the "Killing" tests when "Killing" tests are filtered out', async () => {
      const filters: StateFilter<TestStatus>[] = [
        createStateFilter(TestStatus.Killing, { enabled: false }),
        createStateFilter(TestStatus.NotCovering, { enabled: true }),
      ];
      filterComponent.dispatchEvent(createCustomEvent('filters-changed', filters));
      await sut.whenStable();
      const tests = sut.$$<HTMLSpanElement>('.test-dot');
      expect(tests).lengthOf(1);
      expect(tests[0].getAttribute('test-id')).eq('2');
    });
  });
});
