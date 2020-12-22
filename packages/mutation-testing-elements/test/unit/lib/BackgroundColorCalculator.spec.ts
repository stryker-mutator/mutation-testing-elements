import { expect } from 'chai';
import { BackgroundColorCalculator } from '../../../src/lib/BackgroundColorCalculator';
import { getContextClassForStatus } from '../../../src/lib/htmlHelpers';

const EXPECTED_BACKGROUND_SURVIVED = getContextClassForStatus('Survived') + '-light';
const EXPECTED_BACKGROUND_NO_COVERAGE = getContextClassForStatus('NoCoverage') + '-light';
const EXPECTED_BACKGROUND_TIMEOUT = getContextClassForStatus('Timeout') + '-light';
const EXPECTED_BACKGROUND_KILLED = getContextClassForStatus('Killed') + '-light';
const EXPECTED_BACKGROUND_IGNORED = getContextClassForStatus('Ignored') + '-light';

describe(BackgroundColorCalculator.name, () => {
  let sut: BackgroundColorCalculator;

  beforeEach(() => {
    sut = new BackgroundColorCalculator();
    sut.markMutantStart({ status: 'Killed' });
    sut.markMutantStart({ status: 'Survived' });
    sut.markMutantStart({ status: 'NoCoverage' });
    sut.markMutantStart({ status: 'RuntimeError' });
    sut.markMutantStart({ status: 'Timeout' });
    sut.markMutantStart({ status: 'Ignored' });
  });

  it('should determine no background by default', () => {
    sut.markMutantEnd({ status: 'Killed' });
    sut.markMutantEnd({ status: 'Survived' });
    sut.markMutantEnd({ status: 'NoCoverage' });
    sut.markMutantEnd({ status: 'RuntimeError' });
    sut.markMutantEnd({ status: 'Timeout' });
    sut.markMutantEnd({ status: 'Ignored' });
    expect(sut.determineBackground()).eq(null);
  });

  it('should determine background color for "Survived"', () => {
    expect(sut.determineBackground()).eq(EXPECTED_BACKGROUND_SURVIVED);
  });

  it('should determine background color for "No coverage"', () => {
    sut.markMutantEnd({ status: 'Survived' });
    expect(sut.determineBackground()).eq(EXPECTED_BACKGROUND_NO_COVERAGE);
  });

  it('should determine background color for "Timeout"', () => {
    sut.markMutantEnd({ status: 'Survived' });
    sut.markMutantEnd({ status: 'NoCoverage' });
    expect(sut.determineBackground()).eq(EXPECTED_BACKGROUND_TIMEOUT);
  });

  it('should determine background color for "Killed"', () => {
    sut.markMutantEnd({ status: 'Survived' });
    sut.markMutantEnd({ status: 'NoCoverage' });
    sut.markMutantEnd({ status: 'Timeout' });
    expect(sut.determineBackground()).eq(EXPECTED_BACKGROUND_KILLED);
  });

  it('should determine background color for "Ignored"', () => {
    sut.markMutantEnd({ status: 'Survived' });
    sut.markMutantEnd({ status: 'NoCoverage' });
    sut.markMutantEnd({ status: 'Timeout' });
    sut.markMutantEnd({ status: 'Killed' });
    expect(sut.determineBackground()).eq(EXPECTED_BACKGROUND_IGNORED);
  });
});
