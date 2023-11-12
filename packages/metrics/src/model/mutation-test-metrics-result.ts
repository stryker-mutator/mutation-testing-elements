import type { MetricsResult } from './metrics-result.js';
import type { FileUnderTestModel } from './file-under-test-model.js';
import type { TestMetrics } from './test-metrics.js';
import type { Metrics } from './metrics.js';
import type { TestFileModel } from './test-file-model.js';

export interface MutationTestMetricsResult {
  systemUnderTestMetrics: MetricsResult<FileUnderTestModel, Metrics>;
  testMetrics: MetricsResult<TestFileModel, TestMetrics> | undefined;
}
