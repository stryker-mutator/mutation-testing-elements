import type { FileUnderTestModel } from './file-under-test-model.js';
import type { Metrics } from './metrics.js';
import type { MetricsResult } from './metrics-result.js';
import type { TestFileModel } from './test-file-model.js';
import type { TestMetrics } from './test-metrics.js';

export interface MutationTestMetricsResult {
  systemUnderTestMetrics: MetricsResult<FileUnderTestModel, Metrics>;
  testMetrics: MetricsResult<TestFileModel, TestMetrics> | undefined;
}
