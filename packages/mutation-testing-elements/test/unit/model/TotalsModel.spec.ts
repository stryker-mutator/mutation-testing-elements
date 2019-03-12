import { TotalsModel } from '../../../src/model';
import { MutantResult, MutantStatus } from 'mutation-testing-report-schema';
import { expect } from 'chai';

function mutantResult(overrides?: Partial<MutantResult>) {
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

describe(TotalsModel.name, () => {
  it('should count results of a single file', () => {
    const actual = new TotalsModel([
      mutantResult({ status: MutantStatus.RuntimeError, }),
      mutantResult({ status: MutantStatus.Killed, }),
      mutantResult({ status: MutantStatus.CompileError, }),
      mutantResult({ status: MutantStatus.NoCoverage, }),
      mutantResult({ status: MutantStatus.Survived, }),
      mutantResult({ status: MutantStatus.Killed, }),
      mutantResult({ status: MutantStatus.Timeout, }),
    ]);

    expect(actual.killed, 'killed').to.eq(2);
    expect(actual.compileErrors, 'compileErrors').eq(1);
    expect(actual.runtimeErrors, 'runtimeErrors').eq(1);
    expect(actual.survived, 'survived').to.eq(1);
    expect(actual.noCoverage, 'noCoverage').to.eq(1);
    expect(actual.timeout, 'timeout').to.eq(1);
    expect(actual.totalCovered, 'totalCovered').to.eq(4);
    expect(actual.totalDetected, 'detected').to.eq(3);
    expect(actual.totalMutants, 'mutants').to.eq(7);
    expect(actual.totalValid, 'mutants').to.eq(5);
    expect(actual.totalInvalid, 'mutants').to.eq(2);
    expect(actual.totalUndetected, 'undetected').to.eq(2);
    expect(actual.mutationScoreBasedOnCoveredCode, 'percentageBasedOnCoveredCode').to.eq(75);
    expect(actual.mutationScore, 'mutationScore').to.eq(60);
  });

});
