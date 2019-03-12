import { expect } from 'chai';
import { MutantStatus } from 'mutation-testing-report-schema';
import { BackgroundColorCalculator } from '../../../src/lib/BackgroundColorCalculator';
import { getContextClassForStatus } from '../../../src/lib/htmlHelpers';

const EXPECTED_BACKGROUND_SURVIVED = getContextClassForStatus(MutantStatus.Survived) + '-light';
const EXPECTED_BACKGROUND_NO_COVERAGE = getContextClassForStatus(MutantStatus.NoCoverage) + '-light';
const EXPECTED_BACKGROUND_TIMEOUT = getContextClassForStatus(MutantStatus.Timeout) + '-light';
const EXPECTED_BACKGROUND_KILLED = getContextClassForStatus(MutantStatus.Killed) + '-light';

describe(BackgroundColorCalculator.name, () => {

  let sut: BackgroundColorCalculator;

  beforeEach(() => {
    sut = new BackgroundColorCalculator();
    sut.markMutantStart({ status: MutantStatus.Killed });
    sut.markMutantStart({ status: MutantStatus.Survived });
    sut.markMutantStart({ status: MutantStatus.NoCoverage });
    sut.markMutantStart({ status: MutantStatus.RuntimeError });
    sut.markMutantStart({ status: MutantStatus.Timeout });
  });

  it('should determine no background by default', () => {
    sut.markMutantEnd({ status: MutantStatus.Killed });
    sut.markMutantEnd({ status: MutantStatus.Survived });
    sut.markMutantEnd({ status: MutantStatus.NoCoverage });
    sut.markMutantEnd({ status: MutantStatus.RuntimeError });
    sut.markMutantEnd({ status: MutantStatus.Timeout });
    expect(sut.determineBackground()).eq(null);
  });

  it('should determine background color for "Survived"', () => {
    expect(sut.determineBackground()).eq(EXPECTED_BACKGROUND_SURVIVED);
  });

  it('should determine background color for "No coverage"', () => {
    sut.markMutantEnd({ status: MutantStatus.Survived });
    expect(sut.determineBackground()).eq(EXPECTED_BACKGROUND_NO_COVERAGE);
  });

  it('should determine background color for "Timeout"', () => {
    sut.markMutantEnd({ status: MutantStatus.Survived });
    sut.markMutantEnd({ status: MutantStatus.NoCoverage });
    expect(sut.determineBackground()).eq(EXPECTED_BACKGROUND_TIMEOUT);
  });

  it('should determine background color for "Killed"', () => {
    sut.markMutantEnd({ status: MutantStatus.Survived });
    sut.markMutantEnd({ status: MutantStatus.NoCoverage });
    sut.markMutantEnd({ status: MutantStatus.Timeout });
    expect(sut.determineBackground()).eq(EXPECTED_BACKGROUND_KILLED);
  });
});
