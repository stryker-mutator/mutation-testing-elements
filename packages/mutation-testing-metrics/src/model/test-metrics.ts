export interface TestMetrics {
  /**
   * The total number of tests
   */
  total: number;
  /**
   * The total number of tests that didn't kill any mutants.
   */
  pacifist: number;

  withoutCoverage: number;
}
