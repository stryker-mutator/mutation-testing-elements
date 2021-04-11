import { expect } from 'chai';
import { MetricsResult, TestFileModel, TestMetrics, TestModel } from 'mutation-testing-metrics';
import { MutationTestReportDrawerTestComponent } from '../../../src/components/mutation-test-report-drawer-test/mutation-test-report-drawer-test.component';
import {
  Column,
  MutationTestReportTestMetricsTable,
} from '../../../src/components/mutation-test-report-metrics-table/mutation-test-report-metrics-table.component';
import { MutationTestReportTestViewComponent } from '../../../src/components/mutation-test-report-test-view';
import { createCustomEvent } from '../../../src/lib/custom-events';
import { createTestDefinition, createTestFile, createTestMetricsResult } from '../../helpers/factory';
import { CustomElementFixture } from '../helpers/CustomElementFixture';

describe(MutationTestReportTestViewComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportTestViewComponent>;
  let result: MetricsResult<TestFileModel, TestMetrics>;

  beforeEach(async () => {
    sut = new CustomElementFixture('mutation-test-report-test-view');
    result = createTestMetricsResult({ file: new TestFileModel(createTestFile(), 'foo.js') });
    sut.element.result = result;
    await sut.whenStable();
  });

  describe('the metrics table', () => {
    let metricsTable: MutationTestReportTestMetricsTable<TestFileModel, TestMetrics>;

    beforeEach(() => {
      metricsTable = sut.$('mutation-test-report-metrics-table') as MutationTestReportTestMetricsTable<TestFileModel, TestMetrics>;
    });

    it('should pass the correct columns', () => {
      const expectedColumns: Column<TestMetrics>[] = [
        { key: 'killing', label: '# Killing', width: 'normal', category: 'number' },
        { key: 'notKilling', label: '# Not Killing', width: 'normal', category: 'number' },
        { key: 'notCovering', label: '# Not Covering', width: 'normal', category: 'number' },
        { key: 'total', label: 'Total tests', width: 'large', category: 'number', isHeader: true },
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
      return sut.$('mutation-test-report-drawer-test') as MutationTestReportDrawerTestComponent;
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
      sut.$('mutation-test-report-test-file').dispatchEvent(event);
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
      sut.$('mutation-test-report-test-file').dispatchEvent(createCustomEvent('test-selected', { selected: true, test }));
      const drawer = selectDrawer();
      await sut.whenStable();

      // Act
      sut.$('mutation-test-report-test-file').dispatchEvent(createCustomEvent('test-selected', { selected: false, test }));
      await sut.whenStable();

      // Assert
      expect(drawer.mode).eq('closed');
      expect(drawer.test).eq(test);
    });
  });
});
