import { countFileMetrics, countTestFileMetrics } from '../calculateMetrics.js';
import type { FileUnderTestModel } from './file-under-test-model.js';
import type { Metrics } from './metrics.js';
import type { TestFileModel } from './test-file-model.js';

/**
 * A metrics result of T for a directory or file
 * @type {TFile} Either a file under test, or a test file
 * @type {TMetrics} Either test file metrics or file under test metrics
 */
export class MetricsResult<TFile = FileUnderTestModel, TMetrics = Metrics> {
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
  metrics: TMetrics;

  constructor(name: string, childResults: MetricsResult<TFile, TMetrics>[], metrics: TMetrics, file?: TFile) {
    this.name = name;
    this.childResults = childResults;
    this.metrics = metrics;
    this.file = file;
  }

  public updateParent(value?: MetricsResult<TFile, TMetrics>) {
    this.parent = value;
    this.childResults.forEach((result) => result.updateParent(this));
  }

  public updateAllMetrics() {
    if (this.parent !== undefined) {
      this.parent.updateAllMetrics();
      return;
    }

    this.updateMetrics();
  }

  public updateMetrics() {
    if (this.file === undefined) {
      this.childResults.forEach((childResult) => {
        childResult.updateMetrics();
      });

      const files = this.#getFileModelsRecursively(this.childResults);
      if (files.length === 0) {
        return;
      }
      if ((files[0] as TestFileModel).tests) {
        this.metrics = countTestFileMetrics(files as TestFileModel[]) as TMetrics;
      } else {
        this.metrics = countFileMetrics(files as FileUnderTestModel[]) as TMetrics;
      }

      return;
    }

    if ((this.file as TestFileModel).tests) {
      this.metrics = countTestFileMetrics([this.file as TestFileModel]) as TMetrics;
    } else {
      this.metrics = countFileMetrics([this.file as FileUnderTestModel]) as TMetrics;
    }
  }

  #getFileModelsRecursively(childResults: MetricsResult<TFile, TMetrics>[]): TFile[] {
    const flattenedFiles: TFile[] = [];
    if (childResults.length === 0) {
      return flattenedFiles;
    }

    childResults.forEach((child) => {
      if (child.file) {
        flattenedFiles.push(child.file);
        return;
      }
      flattenedFiles.push(...this.#getFileModelsRecursively(child.childResults));
    });

    return flattenedFiles;
  }
}
