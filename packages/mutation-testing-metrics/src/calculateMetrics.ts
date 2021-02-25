import { compareNames, normalize } from './helpers';
import { FileResult, MutantStatus, MutationTestResult } from 'mutation-testing-report-schema';
import { groupBy } from './helpers';
import { FileUnderTestModel, Metrics, MetricsResult, MutantModel, MutationTestMetricsResult, TestFileModel, TestMetrics, TestModel } from './model';
const DEFAULT_SCORE = NaN;
const ROOT_NAME = 'All files';
const ROOT_NAME_TESTS = 'All tests';

/**
 * Calculates the files-under-test metrics inside of a mutation testing report
 * @param files The files inside the mutation testing report
 * @returns A MetricsResult containing the metrics for the entire report. See `childResults`
 */
export function calculateMetrics(files: Record<string, FileResult>): MetricsResult<FileUnderTestModel, Metrics> {
  const normalizedFiles = normalize(files, (input, name) => new FileUnderTestModel(input, name));
  return calculateDirectoryMetrics(ROOT_NAME, normalizedFiles, countFileMetrics);
}

/**
 * Calculates the full mutation test metrics from both the files-under-test as well as (optionally) the test files.
 * @param result The full mutation test result
 * @returns A MutationTestMetricsResult that contains both the `systemUnderTestMetrics` as well as the `testMetrics`
 */
export function calculateMutationTestMetrics(result: MutationTestResult): MutationTestMetricsResult {
  const { files, testFiles } = result;
  const fileModelsUnderTest = normalize(files, (input, name) => new FileUnderTestModel(input, name));
  if (testFiles) {
    const testFileModels = normalize(testFiles, (input, name) => new TestFileModel(input, name));
    relate(
      Object.values(fileModelsUnderTest).flatMap((file) => file.mutants),
      Object.values(testFileModels).flatMap((file) => file.tests)
    );
    return {
      systemUnderTestMetrics: calculateDirectoryMetrics(ROOT_NAME, fileModelsUnderTest, countFileMetrics),
      testMetrics: calculateDirectoryMetrics(ROOT_NAME_TESTS, testFileModels, countTestFileMetrics),
    };
  }
  return {
    systemUnderTestMetrics: calculateDirectoryMetrics(ROOT_NAME, fileModelsUnderTest, countFileMetrics),
    testMetrics: undefined,
  };
}

function calculateDirectoryMetrics<TFileModel, TMetrics>(
  name: string,
  files: Record<string, TFileModel>,
  calculateMetrics: (files: TFileModel[]) => TMetrics
): MetricsResult<TFileModel, TMetrics> {
  const metrics = calculateMetrics(Object.values(files));
  const childResults = toChildModels(files, calculateMetrics);
  return {
    name,
    childResults,
    metrics,
  };
}

function calculateFileMetrics<TFileModel, TMetrics>(
  fileName: string,
  file: TFileModel,
  calculateMetrics: (files: TFileModel[]) => TMetrics
): MetricsResult<TFileModel, TMetrics> {
  return {
    file,
    name: fileName,
    childResults: [],
    metrics: calculateMetrics([file]),
  };
}

function toChildModels<TFileModel, TMetrics>(
  files: Record<string, TFileModel>,
  calculateMetrics: (files: TFileModel[]) => TMetrics
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
  for (const mutant of mutants) {
    if (mutant.coveredBy || mutant.killedBy) {
      for (const test of tests) {
        if (mutant.coveredBy?.includes(test.id)) {
          mutant.addCoveredBy(test);
          test.addCovered(mutant);
        }
        if (mutant.killedBy?.includes(test.id)) {
          mutant.addKilledBy(test);
          test.addKilled(mutant);
        }
      }
    }
  }
}

function countTestFileMetrics(testFile: TestFileModel[]): TestMetrics {
  const tests = testFile.flatMap((_) => _.tests);
  return {
    total: tests.length,
    killing: tests.reduce((acc, test) => (test.killedMutants?.length ? ++acc : acc), 0),
    notKilling: tests.reduce((acc, test) => (!test.killedMutants?.length ? ++acc : acc), 0),
    notCovering: tests.reduce((acc, test) => (!test.coveredMutants?.length ? ++acc : acc), 0),
  };
}

function countFileMetrics(fileResult: FileUnderTestModel[]): Metrics {
  const mutants = fileResult.flatMap((_) => _.mutants);
  const count = (status: MutantStatus) => mutants.filter((_) => _.status === status).length;
  const killed = count(MutantStatus.Killed);
  const timeout = count(MutantStatus.Timeout);
  const survived = count(MutantStatus.Survived);
  const noCoverage = count(MutantStatus.NoCoverage);
  const runtimeErrors = count(MutantStatus.RuntimeError);
  const compileErrors = count(MutantStatus.CompileError);
  const ignored = count(MutantStatus.Ignored);
  const totalDetected = timeout + killed;
  const totalUndetected = survived + noCoverage;
  const totalCovered = totalDetected + survived;
  const totalValid = totalUndetected + totalDetected;
  const totalInvalid = runtimeErrors + compileErrors;
  return {
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
    totalMutants: totalValid + totalInvalid + ignored,
    mutationScoreBasedOnCoveredCode: totalValid > 0 ? (totalDetected / totalCovered) * 100 || 0 : DEFAULT_SCORE,
  };
}
