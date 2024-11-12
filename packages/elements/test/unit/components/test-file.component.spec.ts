import { MutantModel, TestFileModel, TestStatus } from 'mutation-testing-metrics';
import { renderEmoji } from '../../../src/components/drawer-mutant/util.js';
import type { FileStateFilterComponent, StateFilter } from '../../../src/components/state-filter/state-filter.component.js';
import { TestFileComponent } from '../../../src/components/test-file/test-file.component.js';
import { createCustomEvent } from '../../../src/lib/custom-events.js';
import { createMutantResult, createTestDefinition } from '../helpers/factory.js';
import { CustomElementFixture } from '../helpers/CustomElementFixture.js';
import { html } from 'lit';

describe(TestFileComponent.name, () => {
  let sut: CustomElementFixture<TestFileComponent>;

  beforeEach(() => {
    sut = new CustomElementFixture('mte-test-file');
  });

  function selectStateFilter(): FileStateFilterComponent<TestStatus> {
    return sut.$('mte-state-filter');
  }

  function selectTestListItems(): HTMLLIElement[] {
    return sut.$$('li');
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
        'foo.spec.js',
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
        { enabled: true, count: 2, status: TestStatus.Killing, label: html`${renderEmoji('✅', 'Killing')} ${'Killing'}`, context: 'success' },
        { enabled: true, count: 1, status: TestStatus.Covering, label: html`${renderEmoji('☂', 'Covering')} ${'Covering'}`, context: 'warning' },
        {
          enabled: true,
          count: 1,
          status: TestStatus.NotCovering,
          label: html`${renderEmoji('🌧', 'NotCovering')} ${'NotCovering'}`,
          context: 'caution',
        },
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
        'foo.spec.js',
      );

      // Act
      sut.element.model = model;
      await sut.whenStable();

      // Assert
      const expectedFilters: StateFilter<TestStatus>[] = [
        {
          enabled: true,
          count: 4,
          status: TestStatus.NotCovering,
          label: html`${renderEmoji('🌧', 'NotCovering')} ${'NotCovering'}`,
          context: 'caution',
        },
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
        'foo.spec.js',
      );
      sut.element.model = model;
      await sut.whenStable();

      // Act
      selectStateFilter().dispatchEvent(createCustomEvent('filters-changed', []));
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
        'foo.spec.js',
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
        'foo.spec.js',
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
        'foo.spec.js',
      );
      sut.element.model = model;
      await sut.whenStable();

      expect(sut.$('code tr.line:nth-child(2) .code').innerHTML).contains(
        `<svg height="10" width="12" test-id="spec-1" class="test-dot NotCovering">`,
      );
    });

    it('should add the test title to the svg', async () => {
      const model = new TestFileModel(
        {
          tests: [createTestDefinition({ id: 'spec-1', location: { start: { line: 2, column: 3 } } })],
          source: '\nit("should work", () => {})',
        },
        'foo.spec.js',
      );
      sut.element.model = model;
      await sut.whenStable();

      expect(sut.$('code tr.line:nth-child(2) .code').innerHTML).match(/<title>(<!--.*-->)?foo should bar \(NotCovering\)(<!--.*-->)?<\/title>/);
    });

    it('should place remaining tests at the end', async () => {
      // line 3 doesn't exist
      const model = new TestFileModel(
        {
          tests: [createTestDefinition({ id: 'spec-1', location: { start: { line: 3, column: 1 } } })],
          source: '  it("foo")\n  it("bar")',
        },
        'foo.spec.js',
      );
      sut.element.model = model;
      await sut.whenStable();

      expect(sut.$('code tr.line:nth-child(2) .code').innerHTML).include('test-id="spec-1"');
    });
  });

  describe('with tests with locations', () => {
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
        'foo.spec.js',
      );
      model.tests[0].addKilled(new MutantModel(createMutantResult()));
      sut.element.model = model;
      await sut.whenStable();
      filterComponent = sut.$('mte-state-filter');
    });

    it('should set the test-id attribute', () => {
      const tests = sut.$$('.test-dot');
      expect(tests[0].getAttribute('test-id')).eq('1');
      expect(tests[1].getAttribute('test-id')).eq('2');
    });

    it('should hide the "Killing" tests when "Killing" tests are filtered out', async () => {
      filterComponent.dispatchEvent(createCustomEvent('filters-changed', [TestStatus.NotCovering]));
      await sut.whenStable();
      const tests = sut.$$('.test-dot');
      expect(tests).lengthOf(1);
      expect(tests[0].getAttribute('test-id')).eq('2');
    });

    it('should select the test when a test is clicked', async () => {
      // Arrange
      const testDot = sut.$<SVGElement>('.test-dot[test-id="1"]');

      // Act
      testDot.dispatchEvent(new Event('click', { bubbles: true }));
      await sut.whenStable();

      // Assert
      expect([...testDot.classList]).contains('selected');
    });

    it('should emit a test selected event when a test is clicked', async () => {
      // Arrange
      const testDot = sut.$<SVGElement>('.test-dot[test-id="1"]');
      const expectedTest = sut.element.model!.tests.find((test) => test.id === '1');

      // Act
      const actualEvent = await sut.catchCustomEvent('test-selected', () => {
        testDot.dispatchEvent(new Event('click', { bubbles: true }));
      });

      // Assert
      expect(actualEvent).ok;
      expect(actualEvent!.detail.selected).true;
      expect(actualEvent!.detail.test).eq(expectedTest);
    });

    it('should emit a test deselected event when a test is clicked', async () => {
      // Arrange
      const testDot = sut.$<SVGElement>('.test-dot[test-id="1"]');
      const expectedTest = sut.element.model!.tests.find((test) => test.id === '1');
      testDot.dispatchEvent(new Event('click', { bubbles: true }));
      await sut.whenStable();

      // Act
      const actualEvent = await sut.catchCustomEvent('test-selected', () => {
        testDot.dispatchEvent(new Event('click', { bubbles: true }));
      });

      // Assert
      expect(actualEvent).ok;
      expect(actualEvent!.detail.selected).false;
      expect(actualEvent!.detail.test).eq(expectedTest);
    });

    it('should select the first test on "Next"', async () => {
      // Act
      filterComponent.dispatchEvent(createCustomEvent('next', undefined));
      await sut.whenStable();

      // Assert
      const test = sut.$<SVGElement>('.test-dot[test-id="1"]');
      expect([...test.classList]).contains('selected');
    });
    it('should select the last test on "Previous"', async () => {
      // Act
      filterComponent.dispatchEvent(createCustomEvent('previous', undefined));
      await sut.whenStable();

      // Assert
      const test = sut.$<SVGElement>('.test-dot[test-id="2"]');
      expect([...test.classList]).contains('selected');
    });
    it('should select the second test when the first test was selected test on "Next"', async () => {
      // Arrange
      await selectTest('1');

      // Act
      filterComponent.dispatchEvent(createCustomEvent('next', undefined));
      await sut.whenStable();

      // Assert
      const test = sut.$<SVGElement>('.test-dot[test-id="2"]');
      expect([...test.classList]).contains('selected');
    });
    it('should select the first test when the second test was selected test on "Previous"', async () => {
      // Arrange
      await selectTest('2');

      // Act
      filterComponent.dispatchEvent(createCustomEvent('previous', undefined));
      await sut.whenStable();

      // Assert
      const test = sut.$<SVGElement>('.test-dot[test-id="1"]');
      expect([...test.classList]).contains('selected');
    });

    it('should select the no test on "Next" when there are no tests', async () => {
      // Arrange
      filterComponent.dispatchEvent(createCustomEvent('filters-changed', []));
      await sut.whenStable();

      // Act
      filterComponent.dispatchEvent(createCustomEvent('next', undefined));
      await sut.whenStable();

      // Assert
      expect(sut.$<SVGElement>('.test-dot.selected')).null;
    });

    it('should select the no test on "Previous" when there are no tests', async () => {
      // Arrange
      filterComponent.dispatchEvent(createCustomEvent('filters-changed', []));
      await sut.whenStable();

      // Act
      filterComponent.dispatchEvent(createCustomEvent('previous', undefined));
      await sut.whenStable();

      // Assert
      expect(sut.$<SVGElement>('.test-dot.selected')).null;
    });
    async function selectTest(testId: string) {
      sut.$<SVGElement>(`.test-dot[test-id="${testId}"]`).dispatchEvent(new Event('click', { bubbles: true }));
      await sut.whenStable();
    }
  });

  describe('with tests without locations', () => {
    let filterComponent: FileStateFilterComponent<TestStatus>;

    beforeEach(async () => {
      const model = new TestFileModel(
        {
          tests: [
            createTestDefinition({ id: '1', location: undefined, name: 'should foo into bar' }),
            createTestDefinition({ id: '2', location: undefined, name: 'should baz into qux' }),
          ],
        },
        'foo.spec.js',
      );
      model.tests[0].addKilled(new MutantModel(createMutantResult()));
      sut.element.model = model;
      await sut.whenStable();
      filterComponent = sut.$('mte-state-filter');
    });

    it('should render the tests in a list', () => {
      const tests = sut.$$('li [test-id]');
      expect(tests).lengthOf(2);
      expect(tests.map((test) => test.getAttribute('test-id'))).deep.eq(['1', '2']);
      expect(tests.map((test) => test.innerText)).deep.eq(['✅ should foo into bar [Killing]', '🌧 should baz into qux [NotCovering]']);
    });

    it('should select a test on click', async () => {
      // Arrange
      const testButton = sut.$(`li [test-id="1"]`);
      const expectedTest = sut.element.model!.tests.find((test) => test.id === '1');

      // Act
      const actualEvent = await sut.catchCustomEvent('test-selected', () => {
        testButton.click();
      });

      // Assert
      expect(isSelected('1')).true;
      expect(actualEvent).ok;
      expect(actualEvent!.detail.selected).true;
      expect(actualEvent!.detail.test).eq(expectedTest);
    });

    it('should deselect a test when it is filtered out', async () => {
      // Arrange
      const expectedTest = sut.element.model!.tests.find((test) => test.id === '1');
      await selectTest('1');

      // Act
      const actualEvent = await sut.catchCustomEvent('test-selected', () => {
        filterComponent.dispatchEvent(createCustomEvent('filters-changed', []));
      });

      // Assert
      expect(isSelected('1')).false;
      expect(actualEvent).ok;
      expect(actualEvent!.detail.selected).false;
      expect(actualEvent!.detail.test).eq(expectedTest);
    });

    async function selectTest(testId: string) {
      sut.$(`li [test-id="${testId}"]`).click();
      await sut.whenStable();
    }

    function isSelected(testId: string) {
      return Boolean(sut.$(`li [test-id="${testId}"][data-active=true]`));
    }
  });
});
