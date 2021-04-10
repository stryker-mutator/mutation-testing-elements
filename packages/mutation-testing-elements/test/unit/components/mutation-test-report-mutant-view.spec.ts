import { expect } from 'chai';
import { FileUnderTestModel, Metrics, MetricsResult, MutantModel } from 'mutation-testing-metrics';
import { MutationTestReportDrawerMutant } from '../../../src/components/mutation-test-report-drawer-mutant/mutation-test-report-drawer-mutant.component';
import {
  Column,
  MutationTestReportTestMetricsTable,
} from '../../../src/components/mutation-test-report-metrics-table/mutation-test-report-metrics-table.component';
import { MutationTestReportMutantViewComponent } from '../../../src/components/mutation-test-report-mutant-view';
import { createCustomEvent } from '../../../src/lib/custom-events';
import { createFileResult, createMetricsResult, createMutantResult } from '../../helpers/factory';
import { CustomElementFixture } from '../helpers/CustomElementFixture';

describe(MutationTestReportMutantViewComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportMutantViewComponent>;
  let result: MetricsResult<FileUnderTestModel, Metrics>;

  beforeEach(async () => {
    sut = new CustomElementFixture('mutation-test-report-mutant-view');
    result = createMetricsResult({ file: new FileUnderTestModel(createFileResult(), 'foo.js') });
    sut.element.result = result;
    await sut.whenStable();
  });

  describe('the metrics table', () => {
    let metricsTable: MutationTestReportTestMetricsTable<FileUnderTestModel, Metrics>;

    beforeEach(() => {
      metricsTable = sut.$('mutation-test-report-metrics-table') as MutationTestReportTestMetricsTable<FileUnderTestModel, Metrics>;
    });

    it('should pass the correct columns', () => {
      const expectedColumns: Column<Metrics>[] = [
        { key: 'mutationScore', label: 'Mutation score', category: 'percentage' },
        { key: 'killed', label: '# Killed', category: 'number' },
        { key: 'survived', label: '# Survived', category: 'number' },
        { key: 'timeout', label: '# Timeout', category: 'number' },
        { key: 'noCoverage', label: '# No coverage', category: 'number' },
        { key: 'ignored', label: '# Ignored', category: 'number' },
        { key: 'runtimeErrors', label: '# Runtime errors', category: 'number' },
        { key: 'compileErrors', label: '# Compile errors', category: 'number' },
        { key: 'totalDetected', label: 'Total detected', category: 'number', width: 'large', isHeader: true },
        { key: 'totalUndetected', label: 'Total undetected', category: 'number', width: 'large', isHeader: true },
        { key: 'totalMutants', label: 'Total mutants', category: 'number', width: 'large', isHeader: true },
      ];
      expect(metricsTable.columns).deep.eq(expectedColumns);
    });

    it('should pass the current path', async () => {
      const path = ['some', 'path'];
      sut.element.path = path;
      await sut.whenStable();
      expect(metricsTable.currentPath).eq(path);
    });

    it('should pass thresholds', async () => {
      const thresholds = { high: 67, low: 57 };
      sut.element.thresholds = thresholds;
      await sut.whenStable();
      expect(metricsTable.thresholds).eq(thresholds);
    });

    it('should pass the result', () => {
      expect(metricsTable.model).eq(result);
    });
  });

  describe('the drawer', () => {
    function selectDrawer(): MutationTestReportDrawerMutant {
      return sut.$('mutation-test-report-drawer-mutant') as MutationTestReportDrawerMutant;
    }

    it('should be rendered closed to begin with', () => {
      expect(selectDrawer().mode).eq('closed');
    });

    it('should half open when a mutant is selected', async () => {
      // Arrange
      const mutant = new MutantModel(createMutantResult());
      const event = createCustomEvent('mutant-selected', { selected: true, mutant });
      await sut.whenStable();

      // Act
      sut.$('mutation-test-report-file').dispatchEvent(event);
      await sut.whenStable();
      const drawer = selectDrawer();

      // Assert
      expect(drawer.mode).eq('half');
      expect(drawer.mutant).eq(mutant);
    });

    it('should close when a mutant is deselected', async () => {
      // Arrange
      const mutant = new MutantModel(createMutantResult());
      await sut.whenStable();
      sut.$('mutation-test-report-file').dispatchEvent(createCustomEvent('mutant-selected', { selected: true, mutant }));
      const drawer = selectDrawer();
      await sut.whenStable();

      // Act
      sut.$('mutation-test-report-file').dispatchEvent(createCustomEvent('mutant-selected', { selected: false, mutant }));
      await sut.whenStable();

      // Assert
      expect(drawer.mode).eq('closed');
      expect(drawer.mutant).eq(mutant);
    });
  });
});
