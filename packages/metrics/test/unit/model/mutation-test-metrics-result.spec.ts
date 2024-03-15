import { expect } from 'chai';
import { calculateMutationTestMetrics, MutationTestMetricsResult, TestStatus } from '../../../src/index.js';
import { createFileResult, createMutantResult, createMutationTestResult, createTestDefinition, createTestFile } from '../../helpers/factories.js';

describe(MutationTestMetricsResult.name, () => {
  describe(MutationTestMetricsResult.prototype.updateMutant.name, () => {
    let sut: MutationTestMetricsResult;
    let mutant1;

    beforeEach(() => {
      mutant1 = createMutantResult({ id: 'mutant1', status: 'Pending' });
      sut = calculateMutationTestMetrics(
        createMutationTestResult({
          files: {
            'foo/bar.js': createFileResult({
              mutants: [mutant1, createMutantResult({ id: 'mutant2', status: 'Pending' })],
            }),
            'foo/baz.js': createFileResult({
              mutants: [createMutantResult({ id: 'mutant3', status: 'Pending' }), createMutantResult({ id: 'mutant4', status: 'Pending' })],
            }),
            'bar/qux.js': createFileResult({
              mutants: [createMutantResult({ id: 'mutant5', status: 'Pending' })],
            }),
            'corge.js': createFileResult({ mutants: [createMutantResult({ id: 'mutant6', status: 'Pending' })] }),
          },
          testFiles: {
            'foo/bar.spec.js': createTestFile({ tests: [createTestDefinition({ id: 'test-1' }), createTestDefinition({ id: 'test-2' })] }),
            'foo/baz.spec.js': createTestFile({ tests: [createTestDefinition({ id: 'test-3' })] }),
            'bar/qux.spec.js': createTestFile({ tests: [createTestDefinition({ id: 'test-4' })] }),
            'corge.spec.js': createTestFile({ tests: [createTestDefinition({ id: 'test-5' })] }),
          },
        }),
      );
    });

    it('should update the mutant itself', () => {
      // Arrange
      const actualMutant = sut.systemUnderTestMetrics.childResults
        .find(({ name }) => name === 'foo')
        ?.childResults.find(({ name }) => name === 'bar.js')
        ?.file?.mutants.find((m) => m.id === 'mutant1');

      // Act
      sut.updateMutant({ id: 'mutant1', status: 'Killed' });

      // Assert
      expect(actualMutant?.status).eq('Killed');
    });

    it('should update the correlated tests', () => {
      // Arrange
      const actualSpecFile = sut.testMetrics?.childResults
        .find(({ name }) => name === 'foo')
        ?.childResults.find(({ name }) => name === 'bar.spec.js');
      const actualTest1 = actualSpecFile?.file?.tests.find((t) => t.id === 'test-1');
      const actualTest2 = actualSpecFile?.file?.tests.find((t) => t.id === 'test-2');

      // Act
      sut.updateMutant({ id: 'mutant1', status: 'Killed', coveredBy: ['test-1', 'test-2'], killedBy: ['test-2'] });

      // Assert
      expect(actualTest1?.status).eq(TestStatus.Covering);
      expect(actualTest2?.status).eq(TestStatus.Killing);
    });

    it('should update the parent metrics', () => {
      // Arrange
      const actualFileResult = sut.systemUnderTestMetrics.childResults
        .find(({ name }) => name === 'foo')
        ?.childResults.find(({ name }) => name === 'bar.js');

      // Act
      sut.updateMutant({ id: 'mutant1', status: 'Killed' });
      sut.updateMutant({ id: 'mutant2', status: 'Survived' });

      // Assert
      expect(actualFileResult?.metrics.killed).eq(1);
      expect(actualFileResult?.metrics.survived).eq(1);
      expect(actualFileResult?.metrics.mutationScore).eq(50);
    })

    it('should update the root system under test metrics', () => {
      // Act
      sut.updateMutant({ id: 'mutant1', status: 'Killed' });
      sut.updateMutant({ id: 'mutant2', status: 'Survived' });

      // Assert
      expect(sut.systemUnderTestMetrics.metrics.killed).eq(1);
      expect(sut.systemUnderTestMetrics.metrics.survived).eq(1);
      expect(sut.systemUnderTestMetrics.metrics.mutationScore).eq(50);
    })

    it('should update the parent test metrics', () => {
      // Arrange
      const actualBarSpecFile = sut.testMetrics?.childResults
        .find(({ name }) => name === 'foo')
        ?.childResults.find(({ name }) => name === 'bar.spec.js');
      const actualQuxSpecFile = sut.testMetrics?.childResults
        .find(({ name }) => name === 'bar')
        ?.childResults.find(({ name }) => name === 'qux.spec.js');

      // Act
      sut.updateMutant({ id: 'mutant1', status: 'Killed', coveredBy: ['test-1', 'test-2', 'test-5'], killedBy: ['test-2'] });
      sut.updateMutant({ id: 'mutant2', status: 'Survived', coveredBy: ['test-3', 'test-4']});

      // Assert
      expect(actualBarSpecFile?.metrics.killing).eq(1);
      expect(actualBarSpecFile?.metrics.covering).eq(1);
      expect(actualQuxSpecFile?.metrics.covering).eq(1);
    })

    it('should update the root test metrics', () => {
      // Act
      sut.updateMutant({ id: 'mutant1', status: 'Killed', coveredBy: ['test-1', 'test-2', 'test-5'], killedBy: ['test-2'] });
      sut.updateMutant({ id: 'mutant2', status: 'Survived', coveredBy: ['test-3', 'test-4']});

      // Assert
      expect(sut.testMetrics?.metrics.killing).eq(1);
      expect(sut.testMetrics?.metrics.covering).eq(4);
      expect(sut.testMetrics?.metrics.total).eq(5);
    })
  });
});
