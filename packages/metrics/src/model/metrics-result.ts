import { FileUnderTestModel } from './file-under-test-model';
import { MutationMetrics } from './mutation-metrics';

/**
 * A metrics result of T for a directory or file
 * @type {TFile} Either a file under test, or a test file
 * @type {TMetrics} Either test file metrics or file under test metrics
 */
export class MetricsResult<TFile = FileUnderTestModel, TMetrics = MutationMetrics> {
  /**
   * The parent of this result (if it has one)
   */
  parent: MetricsResult<TFile, TMetrics> | undefined;
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
  #metrics: TMetrics | undefined;
  get metrics(): TMetrics {
    if(!this.#metrics) {
      console.log('Calculating metrics for' + this.name)
      this.#metrics = this.metricsFactory(this);
    }

    return this.#metrics;
  }

  private metricsFactory: (r: MetricsResult<TFile, TMetrics>) => TMetrics;

  constructor(name: string, childResults: MetricsResult<TFile, TMetrics>[], metricsFactory: (r: MetricsResult<TFile, TMetrics>) => TMetrics, file?: TFile) {
    this.name = name;
    this.childResults = childResults;
    this.file = file;
    this.metricsFactory = metricsFactory;
    this.#metrics = metricsFactory(this);
    this.setParent()
  }

  setParent() {
    this.childResults.forEach((child) => {
      child.parent = this;
    });
  }

  invalidateMetrics() {
    this.#metrics = undefined;
    this.parent?.invalidateMetrics();
  }
}
