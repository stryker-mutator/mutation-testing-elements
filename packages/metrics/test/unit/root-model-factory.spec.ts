import { expect } from 'chai';
import { createFileResult, createFileUnderTestModel, createMetricsResult, createMutantResult, createMutationTestResult, createTestDefinition, createTestFile } from '../helpers/factories';
import { FileUnderTestModel, Metrics, MetricsResult, TestFileModel, TestMetrics, generateRootModel } from '../../src';
import { generateMetrics, generateTestMetrics } from '../../src/model/root-model-factory';
import { MutationMetrics } from '../../src/model/mutation-metrics';
import { MutantStatus } from 'mutation-testing-report-schema';

describe(generateRootModel.name, () => {
  it('should normalize file names', () => {
    // Arrange
    const input = createMutationTestResult({
      files: {
        'foo\\bar/baz.js': createFileResult(),
        'corge\\qux.js': createFileResult(),
      }
    });

    // Act
    const { systemUnderTestMetrics } = generateRootModel(input);

    // Assert
    expect(systemUnderTestMetrics.childResults).lengthOf(2);
    expect(systemUnderTestMetrics.childResults[0].name).eq('corge');
    expect(systemUnderTestMetrics.childResults[0].childResults[0].name).eq('qux.js');
    expect(systemUnderTestMetrics.childResults[1].name).eq('foo');
    expect(systemUnderTestMetrics.childResults[1].childResults[0].name).eq('bar');
    expect(systemUnderTestMetrics.childResults[1].childResults[0].childResults[0].name).eq('baz.js');
  });

  it('should determine and strip the common root directory', () => {
    // Arrange
    const input = createMutationTestResult({
      files: {
        'c:\\foo\\bar/baz.js': createFileUnderTestModel({ name: 'baz.js' }),
        'c:\\foo\\bar/baz2.js': createFileUnderTestModel({ name: 'baz2.js' }),
      }
    });

    // Act
    const { systemUnderTestMetrics } = generateRootModel(input);

    // Assert
    expect(systemUnderTestMetrics.childResults).lengthOf(2);
    expect(systemUnderTestMetrics.childResults[0].name).eq('baz.js');
    expect(systemUnderTestMetrics.childResults[1].name).eq('baz2.js');
  });

  it('should relate mutants with their source files', () => {
    // Arrange
    const input = createMutationTestResult({
      files: {
        'foo.js': createFileResult({ mutants: [createMutantResult()] }),
      }
    });

    // Act
    const { systemUnderTestMetrics } = generateRootModel(input);

    // Assert
    const file = systemUnderTestMetrics.childResults[0].file!;
    expect(file.mutants[0].sourceFile).eq(file);
  });

  it('should count results of a single file', () => {
    // Arrange
    const input = createMutationTestResult({
      files: {
        'foo.js': createFileResult({
          mutants: [
            createMutantResult({ status: MutantStatus.Pending }),
            createMutantResult({ status: MutantStatus.RuntimeError }),
            createMutantResult({ status: MutantStatus.Killed }),
            createMutantResult({ status: MutantStatus.CompileError }),
            createMutantResult({ status: MutantStatus.NoCoverage }),
            createMutantResult({ status: MutantStatus.Survived }),
            createMutantResult({ status: MutantStatus.Killed }),
            createMutantResult({ status: MutantStatus.Timeout }),
            createMutantResult({ status: MutantStatus.Ignored }),
          ],
        }),
      }
    });

    // Act
    const { systemUnderTestMetrics } = generateRootModel(input);

    // Assert
    expect(systemUnderTestMetrics.metrics.pending, 'pending').to.eq(1);
    expect(systemUnderTestMetrics.metrics.killed, 'killed').to.eq(2);
    expect(systemUnderTestMetrics.metrics.compileErrors, 'compileErrors').eq(1);
    expect(systemUnderTestMetrics.metrics.runtimeErrors, 'runtimeErrors').eq(1);
    expect(systemUnderTestMetrics.metrics.survived, 'survived').to.eq(1);
    expect(systemUnderTestMetrics.metrics.noCoverage, 'noCoverage').to.eq(1);
    expect(systemUnderTestMetrics.metrics.timeout, 'timeout').to.eq(1);
    expect(systemUnderTestMetrics.metrics.noCoverage, 'ignored').to.eq(1);
    expect(systemUnderTestMetrics.metrics.totalCovered, 'totalCovered').to.eq(4);
    expect(systemUnderTestMetrics.metrics.totalDetected, 'detected').to.eq(3);
    expect(systemUnderTestMetrics.metrics.totalMutants, 'mutants').to.eq(9);
    expect(systemUnderTestMetrics.metrics.totalValid, 'mutants').to.eq(5);
    expect(systemUnderTestMetrics.metrics.totalInvalid, 'mutants').to.eq(2);
    expect(systemUnderTestMetrics.metrics.totalUndetected, 'undetected').to.eq(2);
    expect(systemUnderTestMetrics.metrics.mutationScoreBasedOnCoveredCode, 'percentageBasedOnCoveredCode').to.eq(75);
    expect(systemUnderTestMetrics.metrics.mutationScore, 'mutationScore').to.eq(60);
  });
});

describe(generateMetrics.name, () => {
  it('should wrap results in an "All files" root', () => {
    const rootName = 'All files';
    const actual = generateMetrics<FileUnderTestModel, MutationMetrics>({}, createMetricsResult, rootName);

    expect(actual.name).eq(rootName);
  });


  it('should group files in directories', () => {
    // Arrange
    const input = {
      'foo/bar/baz.js': createFileUnderTestModel({ name: 'baz.js' }),
      'foo/bar/qux.js': createFileUnderTestModel({ name: 'qux.js' }),
      'bar/quux.js': createFileUnderTestModel({ name: 'quux.js' }),
      'foo/corge.java': createFileUnderTestModel({ name: 'corge.java' }),
    };

    // Act
    const actual = generateMetrics(input, createMetricsResult, 'rootName');

    // Assert
    expect(actual.childResults).lengthOf(2);
    expect(actual.childResults[0].name).eq('bar');
    expect(actual.childResults[0].childResults).lengthOf(1);
    expect(actual.childResults[0].childResults[0].name).eq('quux.js');
    expect(actual.childResults[0].childResults[0].childResults).lengthOf(0);
    expect(actual.childResults[1].name).eq('foo');
    expect(actual.childResults[1].childResults).lengthOf(2);
    expect(actual.childResults[1].childResults[0].name).eq('bar');
    expect(actual.childResults[1].childResults[0].childResults).lengthOf(2);
    expect(actual.childResults[1].childResults[0].childResults[0].name).eq('baz.js');
    expect(actual.childResults[1].childResults[0].childResults[1].name).eq('qux.js');
    expect(actual.childResults[1].childResults[1].name).eq('corge.java');
  });



});


describe(generateTestMetrics.name, () => {
  it('should calculate results of a single test file', () => {
    // Arrange
    const input = createMutationTestResult({
      files: {
        'foo.js': createFileResult({
          mutants: [createMutantResult({ id: 'mutant1', coveredBy: ['test-1', 'test-2'], killedBy: ['test-2'] })],
        }),
      },
      testFiles: {
        'foo.spec.js': createTestFile({
          tests: [createTestDefinition({ id: 'test-1' }), createTestDefinition({ id: 'test-2' }), createTestDefinition({ id: 'test-3' })],
        }),
      },
    });

    // Act
    const output = generateRootModel(input);

    // Assert
    const expected = {
      covering: 1,
      total: 3,
      notCovering: 1,
      killing: 1,
    };
    expect(output.testMetrics?.metrics).deep.eq(expected);
  });

  it('should allow for a single test file', () => {
    // Arrange
    const input = createMutationTestResult({
      files: {},
      testFiles: {
        'foo.spec.js': createTestFile({
          tests: [createTestDefinition({ id: 'test-1' })],
        }),
      },
    });

    // Act
    const output = generateRootModel(input);

    // Assert
    expect(output.testMetrics!.file).undefined;
    expect(output.testMetrics!.childResults).lengthOf(1);
  });

  /**
 * When a mutation testing framework doesn't report test files, but _does want to report a list of tests_,
 * it will put those tests in a 'dummy' file with an empty string as name.
 */
  it('should remove a dummy test file from the results', () => {
    // Arrange
    const testFile = createTestFile({
      tests: [createTestDefinition({ id: 'test-1' }), createTestDefinition({ id: 'test-2' }), createTestDefinition({ id: 'test-3' })],
    });
    const input = createMutationTestResult({
      files: {},
      testFiles: {
        '': testFile,
      },
    });

    // Act
    const output = generateRootModel(input);
    const expected = new TestFileModel(testFile, '');
    const actual = output.testMetrics?.childResults[0].file;

    // Assert
    expect(actual?.name).eq(expected.name);
    expect(actual?.tests).lengthOf(expected.tests.length);
  });


  // it('should make files relative to common base path', () => {
  //   // Arrange
  //   const input = createMutationTestResult({
  //     files: {
  //       // absolute path inside the project root
  //       '/home/nicojs/github/stryker/packages/util/src/deep-merge.ts': createFileResult(),
  //       // relative path
  //       'src/immutable.ts': createFileResult(),
  //       // absolute path outside of project root
  //       '/home/nicojs/github/stryker/packages/core/src/app.ts': createFileResult(),
  //     },
  //     testFiles: {
  //       // absolute path inside the project root
  //       '/home/nicojs/github/stryker/packages/util/test/deep-merge.spec.ts': createTestFile(),
  //       // relative path
  //       'test/immutable.spec.ts': createTestFile(),
  //       // absolute path outside of project root
  //       '/home/nicojs/github/stryker/packages/core/test/app.spec.ts': createTestFile(),
  //     },
  //     projectRoot: '/home/nicojs/github/stryker/packages/util',
  //   });

  //   // Act
  //   const output = generateRootModel(input);

  //   // Assert
  //   function collectFileNames(metricsResult: MetricsResult<FileUnderTestModel | TestFileModel, MutationMetrics | TestMetrics>): string[] {
  //     if (metricsResult.file) {
  //       return [metricsResult.file.name];
  //     } else {
  //       return metricsResult.childResults.flatMap((child) => collectFileNames(child));
  //     }
  //   }
  //   // @ts-expect-error
  //   const actualSystemUnderTestFileNames = collectFileNames(output.systemUnderTestMetrics);
  //   // @ts-expect-error
  //   const actualTestFileNames = collectFileNames(output.testMetrics!);
  //   expect(actualSystemUnderTestFileNames).deep.eq(['home/nicojs/github/stryker/packages/core/src/app.ts', 'src/deep-merge.ts', 'src/immutable.ts']);
  //   expect(actualTestFileNames).deep.eq([
  //     'home/nicojs/github/stryker/packages/core/test/app.spec.ts',
  //     'test/deep-merge.spec.ts',
  //     'test/immutable.spec.ts',
  //   ]);
  // });
});
