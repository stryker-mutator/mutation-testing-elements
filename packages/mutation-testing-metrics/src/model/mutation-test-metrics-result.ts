import { MetricsResult } from './metrics-result';
import { FileUnderTestModel } from './file-under-test-model';
import { TestMetrics } from './test-metrics';
import { Metrics } from './metrics';
import { TestFileModel } from './test-file-model';

export interface MutationTestMetricsResult {
  systemUnderTestMetrics: MetricsResult<FileUnderTestModel, Metrics>;
  testMetrics: MetricsResult<TestFileModel, TestMetrics> | undefined;
}
