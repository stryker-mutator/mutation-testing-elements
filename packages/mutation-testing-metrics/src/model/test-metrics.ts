export interface TestMetrics {
  /**
   * The total number of tests
   */
  total: number;
  /**
   * The total number of tests that did end up killing a mutant.
   */
  killing: number;

  /**
   * The total number of tests that didn't kill any mutants (this includes notCovering).
   */
  covering: number;

  /**
   * The total number of tests that didn't even cover a single mutant (useless tests?).
   */
  notCovering: number;
}
