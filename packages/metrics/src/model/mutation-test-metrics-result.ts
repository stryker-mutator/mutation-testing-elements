import type { MetricsResult } from './metrics-result.js';
import type { FileUnderTestModel } from './file-under-test-model.js';
import type { TestMetrics } from './test-metrics.js';
import type { Metrics } from './metrics.js';
import type { TestFileModel } from './test-file-model.js';
import type { MutantModel } from './mutant-model.js';
import type { TestModel } from './test-model.js';
import type { MutantResult } from 'mutation-testing-report-schema';

export class MutationTestMetricsResult {
  systemUnderTestMetrics;
  testMetrics;

  #mutants = new Map<string, MutantModel>();
  #tests = new Map<string, TestModel>();

  constructor(
    systemUnderTestMetrics: MetricsResult<FileUnderTestModel, Metrics>,
    testMetrics: MetricsResult<TestFileModel, TestMetrics> | undefined,
  ) {
    this.systemUnderTestMetrics = systemUnderTestMetrics;
    this.testMetrics = testMetrics;
    collectForEach(this.systemUnderTestMetrics, ({ file }) => file?.mutants.forEach((m) => this.#mutants.set(m.id, m)));
    collectForEach(this.testMetrics, ({ file }) => file?.tests.forEach((t) => this.#tests.set(t.id, t)));
  }

  updateMutant(mutantUpdate: Partial<MutantResult> & Pick<MutantResult, 'id' | 'status'>) {
    const mutant = this.#mutants.get(mutantUpdate.id);
    if (!mutant) {
      throw new Error(`Mutant with id "${mutantUpdate.id}" not found for update.`);
    }

    if (mutantUpdate.killedBy) {
      mutantUpdate.killedBy.forEach((killedByTestId) => {
        const test = this.#tests.get(killedByTestId)!;
        if (test === undefined) {
          return;
        }
        test.addKilled(mutant);
        mutant.addKilledBy(test);
      });
    }

    if (mutantUpdate.coveredBy) {
      mutantUpdate.coveredBy.forEach((coveredByTestId) => {
        const test = this.#tests.get(coveredByTestId)!;
        if (test === undefined) {
          return;
        }
        test.addCovered(mutant);
        mutant.addCoveredBy(test);
      });
    }
    mutant.status = mutantUpdate.status;
  }
}

function collectForEach<TFile, TMetrics>(
  metrics: MetricsResult<TFile, TMetrics> | undefined,
  collect: (result: MetricsResult<TFile, TMetrics>) => void,
) {
  if (metrics) {
    collect(metrics);
    metrics.childResults.forEach((child) => {
      collectForEach(child, collect);
    });
  }
}
