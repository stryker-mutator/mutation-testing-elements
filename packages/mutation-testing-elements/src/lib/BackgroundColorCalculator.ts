import { MutantResult, MutantStatus } from 'mutation-testing-report-schema';
import { getContextClassForStatus } from './htmlHelpers';

/**
 * Class to keep track of the states of the
 * mutants that are active at the cursor while walking the code.
 */
export class BackgroundColorCalculator {
  private killed = 0;
  private noCoverage = 0;
  private survived = 0;
  private timeout = 0;
  private ignored = 0;

  public readonly markMutantStart = (mutant: Pick<MutantResult, 'status'>) => {
    this.countMutant(1, mutant.status);
  }

  public readonly markMutantEnd = (mutant: Pick<MutantResult, 'status'>) => {
    this.countMutant(-1, mutant.status);
  }

  private countMutant(valueToAdd: number, status: MutantStatus) {
    switch (status) {
      case MutantStatus.Killed:
        this.killed += valueToAdd;
        break;
      case MutantStatus.Survived:
        this.survived += valueToAdd;
        break;
      case MutantStatus.Timeout:
        this.timeout += valueToAdd;
        break;
      case MutantStatus.NoCoverage:
        this.noCoverage += valueToAdd;
        break;
      case MutantStatus.Ignored:
        this.ignored += valueToAdd;
        break;
    }
  }

  public determineBackground = () => {
    if (this.survived > 0) {
      return getContextClassForStatus(MutantStatus.Survived) + '-light';
    } else if (this.noCoverage > 0) {
      return getContextClassForStatus(MutantStatus.NoCoverage) + '-light';
    } else if (this.timeout > 0) {
      return getContextClassForStatus(MutantStatus.Timeout) + '-light';
    } else if (this.killed > 0) {
      return getContextClassForStatus(MutantStatus.Killed) + '-light';
    } else if (this.ignored > 0) {
      return getContextClassForStatus(MutantStatus.Ignored) + '-light';
    }
    return null;
  }
}
