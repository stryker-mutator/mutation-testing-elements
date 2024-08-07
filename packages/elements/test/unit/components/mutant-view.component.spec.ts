import type { Metrics, MetricsResult } from 'mutation-testing-metrics';
import { FileUnderTestModel, MutantModel } from 'mutation-testing-metrics';
import type { MutationTestReportDrawerMutant } from '../../../src/components/drawer-mutant/drawer-mutant.component.js';
import type { Column, MutationTestReportTestMetricsTable } from '../../../src/components/metrics-table/metrics-table.component.js';
import { MutationTestReportMutantViewComponent } from '../../../src/components/mutant-view/mutant-view.js';
import { createCustomEvent } from '../../../src/lib/custom-events.js';
import { createFileResult, createMetricsResult, createMutantResult } from '../helpers/factory.js';
import { CustomElementFixture } from '../helpers/CustomElementFixture.js';

describe(MutationTestReportMutantViewComponent.name, () => {
  let sut: CustomElementFixture<MutationTestReportMutantViewComponent>;
  let result: MetricsResult<FileUnderTestModel, Metrics>;

  beforeEach(async () => {
    sut = new CustomElementFixture('mte-mutant-view');
    result = createMetricsResult({ file: new FileUnderTestModel(createFileResult(), 'foo.js') });
    sut.element.result = result;
    await sut.whenStable();
  });

  describe('the metrics table', () => {
    let metricsTable: MutationTestReportTestMetricsTable<FileUnderTestModel, Metrics>;

    beforeEach(() => {
      metricsTable = sut.$('mte-metrics-table');
    });

    it('should pass the correct columns', () => {
      const expectedColumns: Column<Metrics>[] = [
        {
          key: 'mutationScore',
          label: 'Of total',
          tooltip: 'The percentage of mutants that were detected. The higher, the better!',
          category: 'percentage',
          group: 'Mutation score',
        },
        {
          key: 'mutationScoreBasedOnCoveredCode',
          label: 'Of covered',
          tooltip: 'Mutation score based on only the code covered by tests',
          category: 'percentage',
          group: 'Mutation score',
        },
        {
          key: 'killed',
          label: 'Killed',
          tooltip: 'At least one test failed while these mutants were active. This is what you want!',
          category: 'number',
        },
        {
          key: 'survived',
          label: 'Survived',
          tooltip: "All tests passed while these mutants were active. You're missing a test for them.",
          category: 'number',
        },
        {
          key: 'timeout',
          label: 'Timeout',
          tooltip: 'Running the tests while these mutants were active resulted in a timeout. For example, an infinite loop.',
          category: 'number',
        },
        {
          key: 'noCoverage',
          label: 'No coverage',
          tooltip: "These mutants aren't covered by one of your tests and survived as a result.",
          category: 'number',
        },
        {
          key: 'ignored',
          label: 'Ignored',
          tooltip: "These mutants weren't tested because they are ignored. Either by user action, or for another reason.",
          category: 'number',
        },
        {
          key: 'runtimeErrors',
          label: 'Runtime errors',
          tooltip:
            'Running tests when these mutants are active resulted in an error (rather than a failed test). For example: an out of memory error.',
          category: 'number',
        },
        { key: 'compileErrors', label: 'Compile errors', tooltip: 'Mutants that caused a compile error.', category: 'number' },
        {
          key: 'totalDetected',
          label: 'Detected',
          tooltip: 'The number of mutants detected by your tests (killed + timeout).',
          category: 'number',
          width: 'large',
          isBold: true,
        },
        {
          key: 'totalUndetected',
          label: 'Undetected',
          tooltip: 'The number of mutants that are not detected by your tests (survived + no coverage).',
          category: 'number',
          width: 'large',
          isBold: true,
        },
        {
          key: 'totalMutants',
          label: 'Total',
          tooltip: 'All mutants (except runtimeErrors + compileErrors)',
          category: 'number',
          width: 'large',
          isBold: true,
        },
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
      return sut.$('mte-drawer-mutant');
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
      sut.$('mte-file').dispatchEvent(event);
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
      sut.$('mte-file').dispatchEvent(createCustomEvent('mutant-selected', { selected: true, mutant }));
      const drawer = selectDrawer();
      await sut.whenStable();

      // Act
      sut.$('mte-file').dispatchEvent(createCustomEvent('mutant-selected', { selected: false, mutant }));
      await sut.whenStable();

      // Assert
      expect(drawer.mode).eq('closed');
      expect(drawer.mutant).eq(mutant);
    });
  });
});
