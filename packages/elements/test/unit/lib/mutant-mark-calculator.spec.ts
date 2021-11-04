import { expect } from 'chai';
import { MutantStatus } from 'mutation-testing-report-schema/api';
import { MutantMarkCalculator } from '../../../src/lib/mutant-mark-calculator';
import { getContextClassForStatus } from '../../../src/lib/html-helpers';

const EXPECTED_BACKGROUND_SURVIVED = getContextClassForStatus(MutantStatus.Survived) + '-light';
const EXPECTED_BACKGROUND_NO_COVERAGE = getContextClassForStatus(MutantStatus.NoCoverage) + '-light';
const EXPECTED_BACKGROUND_TIMEOUT = getContextClassForStatus(MutantStatus.Timeout) + '-light';
const EXPECTED_BACKGROUND_KILLED = getContextClassForStatus(MutantStatus.Killed) + '-light';
const EXPECTED_BACKGROUND_IGNORED = getContextClassForStatus(MutantStatus.Ignored) + '-light';

describe(MutantMarkCalculator.name, () => {
  let sut: MutantMarkCalculator;

  beforeEach(() => {
    sut = new MutantMarkCalculator();
    sut.markMutantStart({ status: MutantStatus.Killed });
    sut.markMutantStart({ status: MutantStatus.Survived });
    sut.markMutantStart({ status: MutantStatus.NoCoverage });
    sut.markMutantStart({ status: MutantStatus.RuntimeError });
    sut.markMutantStart({ status: MutantStatus.Timeout });
    sut.markMutantStart({ status: MutantStatus.Ignored });
  });

  it('should determine no background by default', () => {
    sut.markMutantEnd({ status: MutantStatus.Killed });
    sut.markMutantEnd({ status: MutantStatus.Survived });
    sut.markMutantEnd({ status: MutantStatus.NoCoverage });
    sut.markMutantEnd({ status: MutantStatus.RuntimeError });
    sut.markMutantEnd({ status: MutantStatus.Timeout });
    sut.markMutantEnd({ status: MutantStatus.Ignored });
    expect(sut.determineMarkerClass()).eq(null);
  });

  it('should determine background color for "Survived"', () => {
    expect(sut.determineMarkerClass()).eq(EXPECTED_BACKGROUND_SURVIVED);
  });

  it('should determine background color for "No coverage"', () => {
    sut.markMutantEnd({ status: MutantStatus.Survived });
    expect(sut.determineMarkerClass()).eq(EXPECTED_BACKGROUND_NO_COVERAGE);
  });

  it('should determine background color for "Timeout"', () => {
    sut.markMutantEnd({ status: MutantStatus.Survived });
    sut.markMutantEnd({ status: MutantStatus.NoCoverage });
    expect(sut.determineMarkerClass()).eq(EXPECTED_BACKGROUND_TIMEOUT);
  });

  it('should determine background color for "Killed"', () => {
    sut.markMutantEnd({ status: MutantStatus.Survived });
    sut.markMutantEnd({ status: MutantStatus.NoCoverage });
    sut.markMutantEnd({ status: MutantStatus.Timeout });
    expect(sut.determineMarkerClass()).eq(EXPECTED_BACKGROUND_KILLED);
  });

  it('should determine background color for "Ignored"', () => {
    sut.markMutantEnd({ status: MutantStatus.Survived });
    sut.markMutantEnd({ status: MutantStatus.NoCoverage });
    sut.markMutantEnd({ status: MutantStatus.Timeout });
    sut.markMutantEnd({ status: MutantStatus.Killed });
    expect(sut.determineMarkerClass()).eq(EXPECTED_BACKGROUND_IGNORED);
  });
});
