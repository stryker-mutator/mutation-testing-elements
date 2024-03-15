import { isNotNullish } from '../helpers/is-not-nullish.js';
import type { FileUnderTestModel } from './file-under-test-model.js';
import type { Metrics } from './metrics.js';

/**
 * A metrics result of T for a directory or file
 * @type {TFile} Either a file under test, or a test file
 * @type {TMetrics} Either test file metrics or file under test metrics
 */
export class MetricsResult<TFile = FileUnderTestModel, TMetrics = Metrics> {
  /**
   * The parent of this result (if it has one)
   */
  protected parent?: MetricsResult<TFile, TMetrics>;
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
   * The way to calculate metrics for this result
   */
  #accumulateMetrics;
  /**
   * The way to calculate metrics from a file
   */
  #toMetrics;
  /**
   * The actual metrics
   */
  #metrics?: TMetrics;

  constructor(
    name: string,
    childResults: MetricsResult<TFile, TMetrics>[],
    accumulateMetrics: (metrics: TMetrics[]) => TMetrics,
    toMetrics: (file: TFile) => TMetrics,
    file?: TFile,
  ) {
    this.name = name;
    this.childResults = childResults;
    this.#accumulateMetrics = accumulateMetrics;
    this.#toMetrics = toMetrics;
    this.file = file;
  }

  public invalidate() {
    this.#metrics = undefined;
    this.parent?.invalidate();
  }

  get metrics(): TMetrics {
    if (this.#metrics === undefined) {
      const myFileMetrics = this.file ? this.#toMetrics(this.file) : undefined;
      this.#metrics = this.#accumulateMetrics([myFileMetrics, ...this.childResults.map((child) => child.metrics)].filter(isNotNullish));
    }
    return this.#metrics;
  }

}
