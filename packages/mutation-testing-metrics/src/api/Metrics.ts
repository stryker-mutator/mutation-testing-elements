/**
 * Container for the metrics of mutation testing
 */
export interface Metrics {
  /**
   * The total number of mutants that were killed
   */
  killed: number;
  /**
   * The total number of mutants that timed out
   */
  timeout: number;
  /**
   * The total number of mutants that were tested but survived
   */
  survived: number;
  /**
   * The total number of mutants that were not even tested because they were not covered by any tests.
   */
  noCoverage: number;
  /**
   * The total number of mutants that caused an error during testing.
   * These didn't effect the mutation score, as they are treated as false positives.
   */
  runtimeErrors: number;
  /**
   * The total number of mutants that caused an error during transpiling.
   * These didn't effect the mutation score. as they are treated as false positives.
   */
  compileErrors: number;
  /**
   * The total number of mutants that were detected, meaning either killed or caused a time out.
   * `killed + timed out`
   */
  totalDetected: number;
  /**
   * The total number of mutants that were undetected, so either survived or were not covered by any code
   * `survived + no coverage`
   */
  totalUndetected: number;
  /**
   * The total number of invalid mutants.
   * `runtimeErrors + transpileErrors`
   */
  totalInvalid: number;
  /**
   * Total number of valid mutants.
   * `totalDetected + totalUndetected`
   */
  totalValid: number;
  /**
   * The total number of mutants.
   * `totalInvalid + totalValid`
   */
  totalMutants: number;
  /**
   * The total number of mutants tested in an area that had code coverage result
   * `totalDetected + survived`
   */
  totalCovered: number;
  /**
   * The total percentage of mutants that were killed.
   * `totalDetected / totalValid * 100`,
   */
  mutationScore: number;
  /**
   * The total percentage of mutants that were killed based on the code coverage results of the initial test run.
   * `totalDetected / totalCovered * 100`
   */
  mutationScoreBasedOnCoveredCode: number;
}
