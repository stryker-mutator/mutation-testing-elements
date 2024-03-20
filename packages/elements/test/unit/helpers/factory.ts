import type { Metrics, TestMetrics } from 'mutation-testing-metrics';
import { MetricsResult, TestFileModel } from 'mutation-testing-metrics';
import type { FileResult, Location, MutantResult, MutationTestResult, TestDefinition, TestFile } from 'mutation-testing-report-schema/api';
import { accumulateFileUnderTestMetrics, accumulateTestMetrics, countFileUnderTestMetrics, countTestFileMetrics } from '../../../../metrics/src/calculateMetrics.js';

export function createMutantResult(overrides?: Partial<MutantResult>): MutantResult {
  const defaults: MutantResult = {
    id: '1',
    location: createLocation(),
    mutatorName: 'bazMutator',
    replacement: 'baz',
    status: 'Killed',
  };
  return { ...defaults, ...overrides };
}

export function createTestDefinition(overrides?: Partial<TestDefinition>): TestDefinition {
  return {
    id: '23',
    name: 'foo should bar',
    location: createLocation(),
    ...overrides,
  };
}

export function createLocation(overrides?: Partial<Location>): Location {
  return {
    end: {
      column: 3,
      line: 1,
    },
    start: {
      column: 1,
      line: 1,
    },
    ...overrides,
  };
}

export function createFileResult(overrides?: Partial<FileResult>): FileResult {
  const defaults: FileResult = {
    language: 'javascript',
    mutants: [createMutantResult()],
    source: 'const bar = foo();',
  };
  return { ...defaults, ...overrides };
}

export function createMetricsResult(overrides?: Partial<MetricsResult>): MetricsResult {
  const result = new MetricsResult('foo', [], accumulateFileUnderTestMetrics, countFileUnderTestMetrics);
  if (overrides?.file) {
    result.file = overrides.file;
  }
  if (overrides?.childResults) {
    result.childResults = overrides.childResults;
  }
  if (overrides?.name) {
    result.name = overrides.name;
  }

  return result;
}

export function createTestMetricsResult(overrides?: Partial<MetricsResult<TestFileModel, TestMetrics>>): MetricsResult<TestFileModel, TestMetrics> {
  const result = new MetricsResult('foo', [], accumulateTestMetrics, countTestFileMetrics, overrides?.file ?? new TestFileModel(createTestFile(), ''));
  if (overrides?.childResults) {
    result.childResults = overrides.childResults;
  }
  if (overrides?.name) {
    result.name = overrides.name;
  }
  return result;
}

export function createTestFile(overrides?: Partial<TestFile>): TestFile {
  return {
    tests: [],
    ...overrides,
  };
}

export function createTestMetrics(overrides?: TestMetrics): TestMetrics {
  return {
    killing: 0,
    notCovering: 0,
    covering: 0,
    total: 0,
    ...overrides,
  };
}

export function createMetrics(overrides?: Metrics): Metrics {
  const defaults: Metrics = {
    pending: 0,
    killed: 0,
    survived: 0,
    timeout: 0,
    compileErrors: 0,
    runtimeErrors: 0,
    noCoverage: 0,
    ignored: 0,
    totalCovered: 0,
    totalDetected: 0,
    totalInvalid: 0,
    totalMutants: 0,
    totalUndetected: 0,
    totalValid: 0,
    mutationScore: 0,
    mutationScoreBasedOnCoveredCode: 0,
  };
  return { ...defaults, ...overrides };
}

export function createReport(overrides?: Partial<MutationTestResult>): MutationTestResult {
  return {
    files: {
      'foobar.js': {
        language: 'javascript',
        mutants: [],
        source: 'foo = "bar";',
      },
    },
    schemaVersion: '1.0',
    thresholds: {
      high: 80,
      low: 60,
    },
    projectRoot: '/src/project',
    ...overrides,
  };
}
