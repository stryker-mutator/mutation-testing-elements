import { FileResult, MutantResult, MutantStatus, MutationTestResult, TestDefinition, TestFile, Location } from 'mutation-testing-report-schema/api';
import { FileUnderTestModel, MetricsResult, TestFileModel } from '../../src';
import { MutationMetrics } from '../../src/model/mutation-metrics';

export function createTestFileModel(overrides?: Partial<TestFileModel>): TestFileModel {
  return new TestFileModel(createTestFile(overrides), overrides?.name ?? 'foo.spec.js');
}

export function createFileUnderTestModel(overrides?: Partial<FileUnderTestModel>): FileUnderTestModel {
  return new FileUnderTestModel(createFileResult(overrides), overrides?.name ?? 'foo.js');
}

export function createMutationTestResult(overrides?: Partial<MutationTestResult>): MutationTestResult {
  return {
    files: {},
    schemaVersion: '1.0',
    thresholds: {
      high: 80,
      low: 60,
    },
    ...overrides,
  };
}

export function createMutantResult(overrides?: Partial<MutantResult>): MutantResult {
  return {
    id: '42',
    location: createLocation(),
    mutatorName: 'FooMutator',
    replacement: '"foo"',
    status: MutantStatus.Killed,
    ...overrides,
  };
}

export function createLocation(overrides?: Partial<Location>): Location {
  return {
    end: {
      column: 4,
      line: 3,
    },
    start: {
      column: 2,
      line: 1,
    },
    ...overrides,
  };
}

export function createFileResult(overrides?: Partial<FileResult>): FileResult {
  return {
    language: 'js',
    mutants: [createMutantResult()],
    source: 'console.log("foo");',
    ...overrides,
  };
}

export function createTestDefinition(overrides?: Partial<TestDefinition>): TestDefinition {
  return {
    id: '52',
    name: 'foo should be bar',
    ...overrides,
  };
}

export function createTestFile(overrides?: Partial<TestFile>): TestFile {
  return {
    tests: [createTestDefinition()],
    ...overrides,
  };
}

export function createMetricsResult(name: string, childResults: MetricsResult<FileUnderTestModel, MutationMetrics>[] = [], file?: FileUnderTestModel | undefined): MetricsResult<FileUnderTestModel, MutationMetrics> {
  const metric = new MetricsResult<FileUnderTestModel, MutationMetrics>(
    name,
    childResults,
    () => createMutationMetrics(),
    file);


  return metric;
}

export function createMutationMetrics(overrides?: Partial<MutationMetrics>): MutationMetrics {
  return {
    compileErrors: 0,
    ignored: 0,
    killed: 0,
    mutationScore: 0,
    mutationScoreBasedOnCoveredCode: 0,
    noCoverage: 0,
    pending: 0,
    runtimeErrors: 0,
    survived: 0,
    timeout: 0,
    totalCovered: 0,
    totalDetected: 0,
    totalInvalid: 0,
    totalMutants: 0,
    totalUndetected: 0,
    totalValid: 0,
    ...overrides
  }
}
