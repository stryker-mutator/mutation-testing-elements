import type { FileResult, MutantStatus, MutationTestResult } from 'mutation-testing-report-schema';

import { compareNames, groupBy, normalize } from './helpers/index.js';
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
  return calculateDirectoryMetrics(ROOT_NAME, normalizedFiles, countFileMetrics);
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
      systemUnderTestMetrics: calculateRootMetrics(ROOT_NAME, fileModelsUnderTest, countFileMetrics),
      testMetrics: calculateRootMetrics(ROOT_NAME_TESTS, testFileModels, countTestFileMetrics),
    };
  }
  return {
    systemUnderTestMetrics: calculateRootMetrics(ROOT_NAME, fileModelsUnderTest, countFileMetrics),
    testMetrics: undefined,
  };
}

function calculateRootMetrics<TFileModel, TMetrics>(
  name: string,
  files: Record<string, TFileModel>,
  calculateMetrics: (files: TFileModel[]) => TMetrics,
) {
  const fileNames = Object.keys(files);
  /**
   * When a mutation testing framework doesn't report test files, but _does want to report a list of tests_,
   * it will put those tests in a 'dummy' file with an empty string as name.
   */
  if (fileNames.length === 1 && fileNames[0] === '') {
    return calculateFileMetrics(name, files[fileNames[0]], calculateMetrics);
  } else {
    return calculateDirectoryMetrics(name, files, calculateMetrics);
  }
}

function calculateDirectoryMetrics<TFileModel, TMetrics>(
  name: string,
  files: Record<string, TFileModel>,
  calculateMetrics: (files: TFileModel[]) => TMetrics,
): MetricsResult<TFileModel, TMetrics> {
  const metrics = calculateMetrics(Object.values(files));
  const childResults = toChildModels(files, calculateMetrics);
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
): MetricsResult<TFileModel, TMetrics>[] {
  const filesByDirectory = groupBy(Object.entries(files), (namedFile) => namedFile[0].split('/')[0]);
  return Object.keys(filesByDirectory)
    .map((directoryName) => {
      if (filesByDirectory[directoryName].length > 1 || filesByDirectory[directoryName][0][0] !== directoryName) {
        const directoryFiles: Record<string, TFileModel> = {};
        filesByDirectory[directoryName].forEach((file) => (directoryFiles[file[0].substr(directoryName.length + 1)] = file[1]));
        return calculateDirectoryMetrics(directoryName, directoryFiles, calculateMetrics);
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
    const coveringTestIds = mutant.coveredBy ?? [];
    for (const testId of coveringTestIds) {
      const test = testMap.get(testId);
      if (test) {
        mutant.addCoveredBy(test);
        test.addCovered(mutant);
      }
    }
    const killingTestIds = mutant.killedBy ?? [];
    for (const testId of killingTestIds) {
      const test = testMap.get(testId);
      if (test) {
        mutant.addKilledBy(test);
        test.addKilled(mutant);
      }
    }
  }
}

export function countTestFileMetrics(testFile: TestFileModel[]): TestMetrics {
  const tests = testFile.flatMap((_) => _.tests);
  const count = (status: TestStatus) => tests.filter((_) => _.status === status).length;

  return {
    total: tests.length,
    killing: count(TestStatus.Killing),
    covering: count(TestStatus.Covering),
    notCovering: count(TestStatus.NotCovering),
  };
}

export function countFileMetrics(fileResult: FileUnderTestModel[]): Metrics {
  const mutants = fileResult.flatMap((_) => _.mutants);
  const count = (status: MutantStatus) => mutants.filter((_) => _.status === status).length;
  const pending = count('Pending');
  const killed = count('Killed');
  const timeout = count('Timeout');
  const survived = count('Survived');
  const noCoverage = count('NoCoverage');
  const runtimeErrors = count('RuntimeError');
  const compileErrors = count('CompileError');
  const ignored = count('Ignored');
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
