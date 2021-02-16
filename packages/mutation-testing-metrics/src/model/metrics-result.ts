import { FileUnderTestModel } from './file-under-test-model';
import { Metrics } from './metrics';

/**
 * A metrics result of T for a directory or file
 * @type {TFile} Either a file under test, or a test file
 * @type {TMetrics} Either test file metrics or file under test metrics
 */
export interface MetricsResult<TFile = FileUnderTestModel, TMetrics = Metrics> {
  /**
   * The name of this result
   */
  name: string;
  /**
   * The file belonging to this metric result (if it represents a single file)
   */
  file?: TFile;
  /**
   * The the child results
   */
  childResults: MetricsResult<TFile, TMetrics>[];
  /**
   * The actual metrics
   */
  metrics: TMetrics;
}
