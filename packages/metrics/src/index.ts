export { calculateMetrics, calculateMutationTestMetrics } from './calculateMetrics.js';
export { aggregateResultsByModule } from './aggregate.js';
export { normalizeFileNames } from './helpers/index.js';
export { MetricsResult, TestModel, FileUnderTestModel, TestFileModel, MutantModel, TestStatus } from './model/index.js';
export type { Metrics, TestMetrics, MutationTestMetricsResult } from './model/index.js';
