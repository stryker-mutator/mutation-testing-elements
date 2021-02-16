/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { calculateMetrics, calculateMutationTestMetrics } from '../../src/calculateMetrics';
import { expect } from 'chai';
import { MutantStatus, FileResultDictionary } from 'mutation-testing-report-schema';
import { TestMetrics } from '../../src/model';
import { createFileResult, createMutantResult, createMutationTestResult, createTestDefinition, createTestFile } from '../helpers/factories';

describe(calculateMetrics.name, () => {
  it('should wrap results in an "All files" root', () => {
    const actual = calculateMetrics({});
    expect(actual.name).eq('All files');
  });

  it('should count results of multiple files', () => {
    // Arrange
    const baz = createFileResult({
      mutants: [createMutantResult({ status: MutantStatus.Killed }), createMutantResult({ status: MutantStatus.Survived })],
    });
    const input: FileResultDictionary = {
      'foo.js': createFileResult({
        mutants: [createMutantResult({ status: MutantStatus.Killed })],
      }),
      'bar/baz.js': baz,
    };

    // Act
    const actual = calculateMetrics(input);

    // Assert
    expect(actual.metrics.killed).eq(2);
    expect(actual.metrics.survived).eq(1);
    expect(actual.childResults).lengthOf(2);
    expect(actual.childResults[0].name).eq('bar');
    expect(actual.childResults[0].file).undefined;
    expect(actual.childResults[0].childResults[0].name).eq('baz.js');
    expect(actual.childResults[0].childResults[0].file).deep.eq(baz);
    expect(actual.childResults[0].metrics).include({
      killed: 1,
      survived: 1,
    });
    expect(actual.childResults[0].metrics).deep.eq(actual.childResults[0].childResults[0].metrics);
    expect(actual.childResults[1].name).eq('foo.js');
    expect(actual.childResults[1].metrics).include({
      killed: 1,
      survived: 0,
    });
  });

  it('should group files in directories', () => {
    // Arrange
    const input = {
      'foo/bar/baz.js': createFileResult(),
      'foo/bar/qux.js': createFileResult(),
      'bar/quux.js': createFileResult(),
      'foo/corge.java': createFileResult(),
    };

    // Act
    const actual = calculateMetrics(input);

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

  it('should normalize file names', () => {
    // Arrange
    const input = {
      'foo\\bar/baz.js': createFileResult(),
      'corge\\qux.js': createFileResult(),
    };

    // Act
    const actual = calculateMetrics(input);

    // Assert
    expect(actual.childResults).lengthOf(2);
    expect(actual.childResults[0].name).eq('corge');
    expect(actual.childResults[0].childResults[0].name).eq('qux.js');
    expect(actual.childResults[1].name).eq('foo');
    expect(actual.childResults[1].childResults[0].name).eq('bar');
    expect(actual.childResults[1].childResults[0].childResults[0].name).eq('baz.js');
  });

  it('should determine and strip the common root directory', () => {
    // Arrange
    const input = {
      'c:\\foo\\bar/baz.js': createFileResult(),
      'c:\\foo\\bar/baz2.js': createFileResult(),
    };

    // Act
    const actual = calculateMetrics(input);

    // Assert
    expect(actual.childResults).lengthOf(2);
    expect(actual.childResults[0].name).eq('baz.js');
    expect(actual.childResults[1].name).eq('baz2.js');
  });

  it('should count results of a single file', () => {
    // Arrange
    const input: FileResultDictionary = {
      'foo.js': createFileResult({
        mutants: [
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
    };

    // Act
    const actual = calculateMetrics(input);

    // Assert
    expect(actual.metrics.killed, 'killed').to.eq(2);
    expect(actual.metrics.compileErrors, 'compileErrors').eq(1);
    expect(actual.metrics.runtimeErrors, 'runtimeErrors').eq(1);
    expect(actual.metrics.survived, 'survived').to.eq(1);
    expect(actual.metrics.noCoverage, 'noCoverage').to.eq(1);
    expect(actual.metrics.timeout, 'timeout').to.eq(1);
    expect(actual.metrics.noCoverage, 'ignored').to.eq(1);
    expect(actual.metrics.totalCovered, 'totalCovered').to.eq(4);
    expect(actual.metrics.totalDetected, 'detected').to.eq(3);
    expect(actual.metrics.totalMutants, 'mutants').to.eq(8);
    expect(actual.metrics.totalValid, 'mutants').to.eq(5);
    expect(actual.metrics.totalInvalid, 'mutants').to.eq(2);
    expect(actual.metrics.totalUndetected, 'undetected').to.eq(2);
    expect(actual.metrics.mutationScoreBasedOnCoveredCode, 'percentageBasedOnCoveredCode').to.eq(75);
    expect(actual.metrics.mutationScore, 'mutationScore').to.eq(60);
  });
});

describe(calculateMutationTestMetrics.name, () => {
  // Grouping and calculation of system under test is already tested with calculateMetrics

  it('should relate tests with mutants (many to many)', () => {
    // Arrange
    const input = createMutationTestResult({
      files: {
        'foo.js': createFileResult({
          mutants: [
            createMutantResult({ id: 'mutant1', coveredBy: ['test-1', 'test-2', 'test-3'], killedBy: ['test-2'] }),
            createMutantResult({ id: 'mutant2', coveredBy: ['test-4', 'test-1'], killedBy: [] }),
          ],
        }),
      },
      testFiles: {
        'foo.spec.js': createTestFile({ tests: [createTestDefinition({ id: 'test-1' }), createTestDefinition({ id: 'test-2' })] }),
        'bar.spec.js': createTestFile({ tests: [createTestDefinition({ id: 'test-3' }), createTestDefinition({ id: 'test-4' })] }),
      },
    });

    // Act
    const output = calculateMutationTestMetrics(input);

    // Assert
    const mutant1 = output.systemUnderTestMetrics.childResults[0].file?.mutants.find((mutant) => mutant.id === 'mutant1');
    const mutant2 = output.systemUnderTestMetrics.childResults[0].file?.mutants.find((mutant) => mutant.id === 'mutant2');
    const test1 = output.testMetrics!.childResults.find((file) => file.name === 'foo.spec.js')!.file!.tests.find((test) => test.id === 'test-1')!;
    const test2 = output.testMetrics!.childResults.find((file) => file.name === 'foo.spec.js')!.file!.tests.find((test) => test.id === 'test-2')!;
    const test3 = output.testMetrics!.childResults.find((file) => file.name === 'bar.spec.js')!.file!.tests.find((test) => test.id === 'test-3')!;
    const test4 = output.testMetrics!.childResults.find((file) => file.name === 'bar.spec.js')!.file!.tests.find((test) => test.id === 'test-4')!;
    expect(mutant1?.killedByTests).deep.eq([test2]);
    expect(mutant1?.coveredByTests).deep.eq([test1, test2, test3]);
    expect(mutant2?.killedByTests).undefined;
    expect(mutant2?.coveredByTests).deep.eq([test1, test4]);
    expect(test1.coveredMutants).deep.eq([mutant1, mutant2]);
    expect(test1.killedMutants).undefined;
    expect(test2.coveredMutants).deep.eq([mutant1]);
    expect(test2.killedMutants).deep.eq([mutant1]);
    expect(test3.coveredMutants).deep.eq([mutant1]);
    expect(test3.killedMutants).undefined;
    expect(test4.coveredMutants).deep.eq([mutant2]);
    expect(test4.killedMutants).undefined;
  });

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
    const output = calculateMutationTestMetrics(input);

    // Assert
    const expected: TestMetrics = {
      notKilling: 2,
      total: 3,
      notCovering: 1,
      killing: 1,
    };
    expect(output.testMetrics?.metrics).deep.eq(expected);
  });
});
