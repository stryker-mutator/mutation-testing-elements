import type { FileResult, MutantStatus, MutationTestResult } from 'mutation-testing-report-schema';

import { groupBy } from './helpers/group-by.js';
import { compareNames, normalize } from './helpers/index.js';
import type { Metrics, MutantModel, MutationTestMetricsResult, TestMetrics, TestModel } from './model/index.js';
import { FileUnderTestModel, MetricsResult, TestFileModel } from './model/index.js';
import { TestStatus } from './model/test-model.js';

const DEFAULT_SCORE = NaN;
const ROOT_NAME = 'All files';
const ROOT_NAME_TESTS = 'All tests';

/**
 * Calculates the files-under-test metrics inside of a mutation testing report
 * @param files The files inside the mutation testing report
 * @returns A MetricsResult containing the metrics for the entire report. See `childResults`
 */
export function calculateMetrics(files: Record<string, FileResult>): MetricsResult<FileUnderTestModel, Metrics> {
  const normalizedFiles = normalize(files, '', (input, name) => new FileUnderTestModel(input, name));
  return calculateDirectoryMetrics(ROOT_NAME, normalizedFiles, countFileMetrics, sumFileMetrics);
}

/**
 * Calculates the full mutation test metrics from both the files-under-test as well as (optionally) the test files.
 * @param result The full mutation test result
 * @returns A MutationTestMetricsResult that contains both the `systemUnderTestMetrics` as well as the `testMetrics`
 */
export function calculateMutationTestMetrics(result: MutationTestResult): MutationTestMetricsResult {
  const { files, testFiles, projectRoot = '' } = result;
  const fileModelsUnderTest = normalize(files, projectRoot, (input, name) => new FileUnderTestModel(input, name));
  if (testFiles && Object.keys(testFiles).length) {
    const testFileModels = normalize(testFiles, projectRoot, (input, name) => new TestFileModel(input, name));
    relate(
      Object.values(fileModelsUnderTest).flatMap((file) => file.mutants),
      Object.values(testFileModels).flatMap((file) => file.tests),
    );
    return {
      systemUnderTestMetrics: calculateRootMetrics(ROOT_NAME, fileModelsUnderTest, countFileMetrics, sumFileMetrics),
      testMetrics: calculateRootMetrics(ROOT_NAME_TESTS, testFileModels, countTestFileMetrics, sumTestFileMetrics),
    };
  }
  return {
    systemUnderTestMetrics: calculateRootMetrics(ROOT_NAME, fileModelsUnderTest, countFileMetrics, sumFileMetrics),
    testMetrics: undefined,
  };
}

function calculateRootMetrics<TFileModel, TMetrics>(
  name: string,
  files: Record<string, TFileModel>,
  calculateMetrics: (files: TFileModel[]) => TMetrics,
  sumMetrics: (metrics: TMetrics[]) => TMetrics,
) {
  const fileNames = Object.keys(files);
  /**
   * When a mutation testing framework doesn't report test files, but _does want to report a list of tests_,
   * it will put those tests in a 'dummy' file with an empty string as name.
   */
  if (fileNames.length === 1 && fileNames[0] === '') {
    return calculateFileMetrics(name, files[fileNames[0]], calculateMetrics);
  } else {
    return calculateDirectoryMetrics(name, files, calculateMetrics, sumMetrics);
  }
}

function calculateDirectoryMetrics<TFileModel, TMetrics>(
  name: string,
  files: Record<string, TFileModel>,
  calculateMetrics: (files: TFileModel[]) => TMetrics,
  sumMetrics: (metrics: TMetrics[]) => TMetrics,
): MetricsResult<TFileModel, TMetrics> {
  // Calculate the metrics of the children first, the metrics of a directory are the sum of its children.
  // This makes the calculation O(files) instead of O(depth * files).
  const childResults = toChildModels(files, calculateMetrics, sumMetrics);
  const metrics = sumMetrics(childResults.map((childResult) => childResult.metrics));
  return new MetricsResult<TFileModel, TMetrics>(name, childResults, metrics);
}

export function calculateFileMetrics<TFileModel, TMetrics>(
  fileName: string,
  file: TFileModel,
  calculateMetrics: (files: TFileModel[]) => TMetrics,
): MetricsResult<TFileModel, TMetrics> {
  return new MetricsResult<TFileModel, TMetrics>(fileName, [], calculateMetrics([file]), file);
}

function toChildModels<TFileModel, TMetrics>(
  files: Record<string, TFileModel>,
  calculateMetrics: (files: TFileModel[]) => TMetrics,
  sumMetrics: (metrics: TMetrics[]) => TMetrics,
): MetricsResult<TFileModel, TMetrics>[] {
  const filesByDirectory = groupBy(Object.entries(files), (namedFile) => namedFile[0].split('/')[0]);
  return Object.keys(filesByDirectory)
    .map((directoryName) => {
      if (filesByDirectory[directoryName]!.length > 1 || filesByDirectory[directoryName]?.[0][0] !== directoryName) {
        const directoryFiles = filesByDirectory[directoryName]!.reduce(
          (directoryFiles, [fileName, file]) => {
            directoryFiles[fileName.slice(directoryName.length + 1)] = file;
            return directoryFiles;
          },
          {} as Record<string, TFileModel>,
        );
        return calculateDirectoryMetrics(directoryName, directoryFiles, calculateMetrics, sumMetrics);
      } else {
        const [fileName, file] = filesByDirectory[directoryName][0];
        return calculateFileMetrics(fileName, file, calculateMetrics);
      }
    })
    .sort(compareNames);
}

function relate(mutants: MutantModel[], tests: TestModel[]) {
  // Create a testId -> TestModel map for fast lookup
  const testMap = new Map<string, TestModel>(tests.map((test) => [test.id, test]));

  for (const mutant of mutants) {
    mutant.relateTests(testMap);
    const { coveredBy, killedBy } = mutant;
    if (coveredBy) {
      for (let i = 0; i < coveredBy.length; i++) {
        const test = testMap.get(coveredBy[i]);
        if (test) {
          // Reuse the canonical test id string. JSON.parse allocates a new string for each
          // occurrence, which wastes hundreds of MB on large reports.
          coveredBy[i] = test.id;
          test.addCoveredUnchecked(mutant);
        }
      }
    }
    if (killedBy) {
      for (let i = 0; i < killedBy.length; i++) {
        const test = testMap.get(killedBy[i]);
        if (test) {
          killedBy[i] = test.id;
          test.addKilledUnchecked(mutant);
        }
      }
    }
  }
}

export function countTestFileMetrics(testFile: TestFileModel[]): TestMetrics {
  const metrics: TestMetrics = { total: 0, killing: 0, covering: 0, notCovering: 0 };
  for (const file of testFile) {
    for (const test of file.tests) {
      metrics.total++;
      switch (test.status) {
        case TestStatus.Killing:
          metrics.killing++;
          break;
        case TestStatus.Covering:
          metrics.covering++;
          break;
        case TestStatus.NotCovering:
          metrics.notCovering++;
          break;
      }
    }
  }
  return metrics;
}

export function sumTestFileMetrics(metrics: TestMetrics[]): TestMetrics {
  const result: TestMetrics = { total: 0, killing: 0, covering: 0, notCovering: 0 };
  for (const metric of metrics) {
    result.total += metric.total;
    result.killing += metric.killing;
    result.covering += metric.covering;
    result.notCovering += metric.notCovering;
  }
  return result;
}

export function countFileMetrics(fileResult: FileUnderTestModel[]): Metrics {
  const countByStatus: Record<MutantStatus, number> = {
    Pending: 0,
    Killed: 0,
    Timeout: 0,
    Survived: 0,
    NoCoverage: 0,
    RuntimeError: 0,
    CompileError: 0,
    Ignored: 0,
  };
  for (const file of fileResult) {
    for (const mutant of file.mutants) {
      countByStatus[mutant.status]++;
    }
  }
  return toMetrics(
    countByStatus.Pending,
    countByStatus.Killed,
    countByStatus.Timeout,
    countByStatus.Survived,
    countByStatus.NoCoverage,
    countByStatus.RuntimeError,
    countByStatus.CompileError,
    countByStatus.Ignored,
  );
}

export function sumFileMetrics(metrics: Metrics[]): Metrics {
  let pending = 0,
    killed = 0,
    timeout = 0,
    survived = 0,
    noCoverage = 0,
    runtimeErrors = 0,
    compileErrors = 0,
    ignored = 0;
  for (const metric of metrics) {
    pending += metric.pending;
    killed += metric.killed;
    timeout += metric.timeout;
    survived += metric.survived;
    noCoverage += metric.noCoverage;
    runtimeErrors += metric.runtimeErrors;
    compileErrors += metric.compileErrors;
    ignored += metric.ignored;
  }
  return toMetrics(pending, killed, timeout, survived, noCoverage, runtimeErrors, compileErrors, ignored);
}

function toMetrics(
  pending: number,
  killed: number,
  timeout: number,
  survived: number,
  noCoverage: number,
  runtimeErrors: number,
  compileErrors: number,
  ignored: number,
): Metrics {
  const totalDetected = timeout + killed;
  const totalUndetected = survived + noCoverage;
  const totalCovered = totalDetected + survived;
  const totalValid = totalUndetected + totalDetected;
  const totalInvalid = runtimeErrors + compileErrors;
  return {
    pending,
    killed,
    timeout,
    survived,
    noCoverage,
    runtimeErrors,
    compileErrors,
    ignored,
    totalDetected,
    totalUndetected,
    totalCovered,
    totalValid,
    totalInvalid,
    mutationScore: totalValid > 0 ? (totalDetected / totalValid) * 100 : DEFAULT_SCORE,
    totalMutants: totalValid + totalInvalid + ignored + pending,
    mutationScoreBasedOnCoveredCode: totalValid > 0 ? (totalDetected / totalCovered) * 100 || 0 : DEFAULT_SCORE,
  };
}
