import type { FileResult, Location, MutantResult, MutationTestResult, TestDefinition, TestFile } from 'mutation-testing-report-schema';
import { FileUnderTestModel, TestFileModel } from '../../src/index.js';

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
    status: 'Killed',
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
    name: overrides?.id ?? 'foo should be bar',
    ...overrides,
  };
}

export function createTestFile(overrides?: Partial<TestFile>): TestFile {
  return {
    tests: [createTestDefinition()],
    ...overrides,
  };
}
