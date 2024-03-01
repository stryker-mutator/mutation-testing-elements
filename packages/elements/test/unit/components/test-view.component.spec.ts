import type { MetricsResult, TestMetrics } from 'mutation-testing-metrics';
import { TestFileModel, TestModel } from 'mutation-testing-metrics';
import type { MutationTestReportDrawerTestComponent } from '../../../src/components/drawer-test/drawer-test.component.js';
import type { Column, MutationTestReportTestMetricsTable } from '../../../src/components/metrics-table/metrics-table.component.js';
import { MutationTestReportTestViewComponent } from '../../../src/components/test-view/test-view.js';
import { createCustomEvent } from '../../../src/lib/custom-events.js';
import { createTestDefinition, createTestFile, createTestMetricsResult } from '../helpers/factory.js';
import { CustomElementFixture } from '../helpers/CustomElementFixture.js';

describe(MutationTestReportTestViewComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportTestViewComponent>;
  let result: MetricsResult<TestFileModel, TestMetrics>;

  beforeEach(async () => {
    sut = new CustomElementFixture('mte-test-view');
    result = createTestMetricsResult({ file: new TestFileModel(createTestFile(), 'foo.js') });
    sut.element.result = result;
    await sut.whenStable();
  });

  describe('the metrics table', () => {
    let metricsTable: MutationTestReportTestMetricsTable<TestFileModel, TestMetrics>;

    beforeEach(() => {
      metricsTable = sut.$('mte-metrics-table');
    });

    it('should pass the correct columns', () => {
      const expectedColumns: Column<TestMetrics>[] = [
        { key: 'killing', label: 'Killing', tooltip: 'These tests killed at least one mutant', width: 'normal', category: 'number' },
        {
          key: 'covering',
          label: 'Covering',
          tooltip: 'These tests are covering at least one mutant, but not killing any of them.',
          width: 'normal',
          category: 'number',
        },
        {
          key: 'notCovering',
          label: 'Not Covering',
          tooltip: 'These tests were not covering a mutant (and thus not killing any of them).',
          width: 'normal',
          category: 'number',
        },
        { key: 'total', label: 'Total tests', width: 'large', category: 'number', isBold: true },
      ];
      expect(metricsTable.columns).deep.eq(expectedColumns);
    });

    it('should pass the current path', async () => {
      const path = ['some', 'path'];
      sut.element.path = path;
      await sut.whenStable();
      expect(metricsTable.currentPath).eq(path);
    });

    it('should pass the result', () => {
      expect(metricsTable.model).eq(result);
    });
  });

  describe('the drawer', () => {
    function selectDrawer(): MutationTestReportDrawerTestComponent {
      return sut.$('mte-drawer-test');
    }

    it('should be rendered closed to begin with', () => {
      expect(selectDrawer().mode).eq('closed');
    });

    it('should half open when a test is selected', async () => {
      // Arrange
      const test = new TestModel(createTestDefinition());
      const event = createCustomEvent('test-selected', { selected: true, test });
      await sut.whenStable();

      // Act
      sut.$('mte-test-file').dispatchEvent(event);
      await sut.whenStable();
      const drawer = selectDrawer();

      // Assert
      expect(drawer.mode).eq('half');
      expect(drawer.test).eq(test);
    });

    it('should close when a test is deselected', async () => {
      // Arrange
      const test = new TestModel(createTestDefinition());
      await sut.whenStable();
      sut.$('mte-test-file').dispatchEvent(createCustomEvent('test-selected', { selected: true, test }));
      const drawer = selectDrawer();
      await sut.whenStable();

      // Act
      sut.$('mte-test-file').dispatchEvent(createCustomEvent('test-selected', { selected: false, test }));
      await sut.whenStable();

      // Assert
      expect(drawer.mode).eq('closed');
      expect(drawer.test).eq(test);
    });
  });
});
