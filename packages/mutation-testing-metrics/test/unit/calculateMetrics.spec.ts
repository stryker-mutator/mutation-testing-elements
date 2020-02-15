import { calculateMetrics } from '../../src/calculateMetrics';
import { expect } from 'chai';
import { MutantResult, MutantStatus, FileResult, FileResultDictionary } from 'mutation-testing-report-schema';

describe(calculateMetrics.name, () => {

  function mutantResultFactory(overrides?: Partial<MutantResult>) {
    const defaults: MutantResult = {
      id: '42',
      location: {
        end: {
          column: 4,
          line: 3
        },
        start: {
          column: 2,
          line: 1
        }
      },
      mutatorName: 'FooMutator',
      replacement: '"foo"',
      status: MutantStatus.Killed
    };
    return { ...defaults, ...overrides };
  }

  function fileResultFactory(overrides?: Partial<FileResult>): FileResult {
    const defaults: FileResult = {
      language: 'js',
      mutants: [mutantResultFactory()],
      source: 'console.log("foo");'
    };
    return { ...defaults, ...overrides };
  }

  it('should wrap results in an "All files" root', () => {
    const actual = calculateMetrics({});
    expect(actual.name).eq('All files');
  });

  it('should count results of multiple files', () => {
    // Arrange
    const baz = fileResultFactory({
      mutants: [
        mutantResultFactory({ status: MutantStatus.Killed }),
        mutantResultFactory({ status: MutantStatus.Survived })
      ]
    });
    const input: FileResultDictionary = {
      'foo.js': fileResultFactory({
        mutants: [
          mutantResultFactory({ status: MutantStatus.Killed })
        ]
      }),
      'bar/baz.js': baz
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
    expect(actual.childResults[0].childResults[0].file).eq(baz);
    expect(actual.childResults[0].metrics).include({
      killed: 1,
      survived: 1
    });
    expect(actual.childResults[0].metrics).deep.eq(actual.childResults[0].childResults[0].metrics);
    expect(actual.childResults[1].name).eq('foo.js');
    expect(actual.childResults[1].metrics).include({
      killed: 1,
      survived: 0
    });
  });

  it('should group files in directories', () => {
    // Arrange
    const input = {
      'foo/bar/baz.js': fileResultFactory(),
      'foo/bar/qux.js': fileResultFactory(),
      'bar/quux.js': fileResultFactory(),
      'foo/corge.java': fileResultFactory()
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
      'foo\\bar/baz.js': fileResultFactory(),
      'corge\\qux.js': fileResultFactory(),
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
      'c:\\foo\\bar/baz.js': fileResultFactory(),
      'c:\\foo\\bar/baz2.js': fileResultFactory(),
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
      'foo.js': fileResultFactory({
        mutants: [
          mutantResultFactory({ status: MutantStatus.RuntimeError, }),
          mutantResultFactory({ status: MutantStatus.Killed, }),
          mutantResultFactory({ status: MutantStatus.CompileError, }),
          mutantResultFactory({ status: MutantStatus.NoCoverage, }),
          mutantResultFactory({ status: MutantStatus.Survived, }),
          mutantResultFactory({ status: MutantStatus.Killed, }),
          mutantResultFactory({ status: MutantStatus.Timeout, }),
          mutantResultFactory({ status: MutantStatus.Ignored, }),
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
