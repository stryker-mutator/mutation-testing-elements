import { MutantResult, MutantStatus } from 'mutation-testing-report-schema';

const DEFAULT_SCORE = 100;
export class TotalsModel {
  /**
   * The total number of mutants that were killed
   */
  public readonly killed: number;
  /**
   * The total number of mutants that timed out
   */
  public readonly timeout: number;
  /**
   * The total number of mutants that were tested but survived
   */
  public readonly survived: number;
  /**
   * The total number of mutants that were not even tested because they were not covered by any tests.
   */
  public readonly noCoverage: number;
  /**
   * The total number of mutants that caused an error during testing.
   * These didn't effect the mutation score, as they are treated as false positives.
   */
  public readonly runtimeErrors: number;
  /**
   * The total number of mutants that caused an error during transpiling.
   * These didn't effect the mutation score. as they are treated as false positives.
   */
  public readonly compileErrors: number;
  /**
   * The total number of mutants that were detected, meaning either killed or caused a time out.
   * `killed + timed out`
   */
  public readonly totalDetected: number;
  /**
   * The total number of mutants that were undetected, so either survived or were not covered by any code
   * `survived + no coverage`
   */
  public readonly totalUndetected: number;
  /**
   * The total number of invalid mutants.
   * `runtimeErrors + transpileErrors`
   */
  public readonly totalInvalid: number;
  /**
   * Total number of valid mutants.
   * `totalDetected + totalUndetected`
   */
  public readonly totalValid: number;
  /**
   * The total number of mutants.
   * `totalInvalid + totalValid`
   */
  public readonly totalMutants: number;
  /**
   * The total number of mutants tested in an area that had code coverage result
   * `totalDetected + survived`
   */
  public readonly totalCovered: number;
  /**
   * The total percentage of mutants that were killed.
   * `totalDetected / totalValid * 100`,
   */
  public readonly mutationScore: number;
  /**
   * The total percentage of mutants that were killed based on the code coverage results of the initial test run.
   * `totalDetected / totalCovered * 100`
   */
  public readonly mutationScoreBasedOnCoveredCode: number;

  constructor(mutants: ReadonlyArray<MutantResult>) {
    const count = (status: MutantStatus) => mutants.filter(_ => _.status === status).length;

    this.killed = count(MutantStatus.Killed);
    this.timeout = count(MutantStatus.Timeout);
    this.survived = count(MutantStatus.Survived);
    this.noCoverage = count(MutantStatus.NoCoverage);
    this.runtimeErrors = count(MutantStatus.RuntimeError);
    this.compileErrors = count(MutantStatus.CompileError);
    this.totalDetected = this.timeout + this.killed;
    this.totalUndetected = this.survived + this.noCoverage;
    this.totalCovered = this.totalDetected + this.survived;
    this.totalValid = this.totalUndetected + this.totalDetected;
    this.totalInvalid = this.runtimeErrors + this.compileErrors;
    this.totalMutants = this.totalValid + this.totalInvalid;
    this.mutationScore = this.totalValid > 0 ? this.totalDetected / this.totalValid * 100 : DEFAULT_SCORE;
    this.mutationScoreBasedOnCoveredCode = this.totalValid > 0 ? this.totalDetected / this.totalCovered * 100 || 0 : DEFAULT_SCORE;
  }
}
