import { FileResult, MutantResult, MutantStatus, MutationTestResult, TestDefinition, TestFile, Location } from 'mutation-testing-report-schema';

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
