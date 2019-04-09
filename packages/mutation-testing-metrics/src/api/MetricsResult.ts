import { FileResult } from 'mutation-testing-report-schema';
import { Metrics } from './Metrics';

/**
 * A metrics result for a directory or file
 */
export interface MetricsResult {
  /**
   * The name of this result
   */
  name: string;
  /**
   * The file belonging to this metric result (if it represents a single file)
   */
  file?: FileResult;
  /**
   * The the child results
   */
  childResults: MetricsResult[];
  /**
   * The actual metrics
   */
  metrics: Metrics;
}
