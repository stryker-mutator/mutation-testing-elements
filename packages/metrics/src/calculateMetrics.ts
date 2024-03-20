import { compareNames, normalize, groupBy } from './helpers/index.js';
import type { FileResult, MutationTestResult } from 'mutation-testing-report-schema';
import type { MutantStatus } from 'mutation-testing-report-schema';
import type { Metrics, MutantModel, TestMetrics, TestModel } from './model/index.js';
import { MutationTestMetricsResult } from './model/index.js';
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
  return calculateDirectoryMetrics(ROOT_NAME, normalizedFiles, accumulateFileUnderTestMetrics, countFileUnderTestMetrics);
}

/**
 * Calculates the full mutation test metrics from both the files-under-test as well as (optionally) the test files.
 * @param result The full mutation test result
 * @returns A MutationTestMetricsResult that contains both the `systemUnderTestMetrics` as well as the `testMetrics`
 */
export function calculateMutationTestMetrics(result: MutationTestResult): MutationTestMetricsResult {
  const { files, testFiles, projectRoot = '' } = result;
  const fileModelsUnderTest = normalize(files, projectRoot, (input, name) => new FileUnderTestModel(input, name));
  const systemUnderTestMetrics = calculateRootMetrics(ROOT_NAME, fileModelsUnderTest, accumulateFileUnderTestMetrics, countFileUnderTestMetrics);

  if (testFiles && Object.keys(testFiles).length) {
    const testFileModels = normalize(testFiles, projectRoot, (input, name) => new TestFileModel(input, name));
    relate(
      Object.values(fileModelsUnderTest).flatMap((file) => file.mutants),
      Object.values(testFileModels).flatMap((file) => file.tests),
    );
    const testMetrics = calculateRootMetrics(ROOT_NAME_TESTS, testFileModels, accumulateTestMetrics, countTestFileMetrics);
    return new MutationTestMetricsResult(systemUnderTestMetrics, testMetrics);
  }
  return new MutationTestMetricsResult(systemUnderTestMetrics, undefined);
}

function calculateRootMetrics<TFileModel, TMetrics>(
  name: string,
  files: Record<string, TFileModel>,
  accumulateMetrics: (metrics: TMetrics[]) => TMetrics,
  toMetrics: (files: TFileModel) => TMetrics,
) {
  const fileNames = Object.keys(files);
  /**
   * When a mutation testing framework doesn't report test files, but _does want to report a list of tests_,
   * it will put those tests in a 'dummy' file with an empty string as name.
   */
  if (fileNames.length === 1 && fileNames[0] === '') {
    return calculateFileMetrics(name, files[fileNames[0]], accumulateMetrics, toMetrics);
  } else {
    return calculateDirectoryMetrics(name, files, accumulateMetrics, toMetrics);
  }
}

function calculateDirectoryMetrics<TFileModel, TMetrics>(
  name: string,
  files: Record<string, TFileModel>,
  accumulateMetrics: (metrics: TMetrics[]) => TMetrics,
  toMetrics: (files: TFileModel) => TMetrics,
): MetricsResult<TFileModel, TMetrics> {
  const childResults = toChildModels(files, accumulateMetrics, toMetrics);
  return new MetricsResult<TFileModel, TMetrics>(name, childResults, accumulateMetrics, toMetrics);
}

export function calculateFileMetrics<TFileModel, TMetrics>(
  fileName: string,
  file: TFileModel,
  accumulateMetrics: (metrics: TMetrics[]) => TMetrics,
  toMetrics: (files: TFileModel) => TMetrics,
): MetricsResult<TFileModel, TMetrics> {
  return new MetricsResult<TFileModel, TMetrics>(fileName, [], accumulateMetrics, toMetrics, file);
}

function toChildModels<TFileModel, TMetrics>(
  files: Record<string, TFileModel>,
  accumulateMetrics: (metrics: TMetrics[]) => TMetrics,
  toMetrics: (files: TFileModel) => TMetrics,
): MetricsResult<TFileModel, TMetrics>[] {
  const filesByDirectory = groupBy(Object.entries(files), (namedFile) => namedFile[0].split('/')[0]);
  return Object.keys(filesByDirectory)
    .map((directoryName) => {
      if (filesByDirectory[directoryName].length > 1 || filesByDirectory[directoryName][0][0] !== directoryName) {
        const directoryFiles: Record<string, TFileModel> = {};
        filesByDirectory[directoryName].forEach((file) => (directoryFiles[file[0].substr(directoryName.length + 1)] = file[1]));
        return calculateDirectoryMetrics(directoryName, directoryFiles, accumulateMetrics, toMetrics);
      } else {
        const [fileName, file] = filesByDirectory[directoryName][0];
        return calculateFileMetrics(fileName, file, accumulateMetrics, toMetrics);
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

export function countTestFileMetrics(testFile: TestFileModel): TestMetrics {
  const count = (status: TestStatus) => testFile.tests.filter((_) => _.status === status).length;

  return {
    total: testFile.tests.length,
    killing: count(TestStatus.Killing),
    covering: count(TestStatus.Covering),
    notCovering: count(TestStatus.NotCovering),
  };
}

export function accumulateTestMetrics(metrics: readonly Readonly<TestMetrics>[]): Readonly<TestMetrics> {
  if (metrics.length === 1) {
    return metrics[0];
  }
  const reduceMetricValue = (property: keyof TestMetrics) => metrics.reduce((previous, current) => previous + current[property], 0);
  return {
    total: reduceMetricValue('total'),
    killing: reduceMetricValue('killing'),
    covering: reduceMetricValue('covering'),
    notCovering: reduceMetricValue('notCovering'),
  };
}

type BaseMetrics = Pick<Metrics, 'compileErrors' | 'ignored' | 'killed' | 'survived' | 'timeout' | 'pending' | 'noCoverage' | 'runtimeErrors'>;

export function countFileUnderTestMetrics(fileResult: FileUnderTestModel): Metrics {
  const count = (status: MutantStatus) => fileResult.mutants.filter((_) => _.status === status).length;
  return deriveMetrics({
    pending: count('Pending'),
    compileErrors: count('CompileError'),
    ignored: count('Ignored'),
    killed: count('Killed'),
    noCoverage: count('NoCoverage'),
    survived: count('Survived'),
    timeout: count('Timeout'),
    runtimeErrors: count('RuntimeError'),
  });
}

export function accumulateFileUnderTestMetrics(metrics: readonly Readonly<Metrics>[]): Readonly<Metrics> {
  if (metrics.length === 1) {
    return metrics[0];
  }

  const reduceMetricValues = (property: keyof BaseMetrics) => metrics.reduce((previous, current) => previous + current[property], 0);

  const baseMetrics: BaseMetrics = {
    pending: reduceMetricValues('pending'),
    compileErrors: reduceMetricValues('compileErrors'),
    ignored: reduceMetricValues('ignored'),
    killed: reduceMetricValues('killed'),
    survived: reduceMetricValues('survived'),
    timeout: reduceMetricValues('timeout'),
    runtimeErrors: reduceMetricValues('runtimeErrors'),
    noCoverage: reduceMetricValues('noCoverage'),
  };
  return deriveMetrics(baseMetrics);
}

function deriveMetrics({ pending, compileErrors, ignored, killed, noCoverage, survived, timeout, runtimeErrors }: BaseMetrics) {
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
