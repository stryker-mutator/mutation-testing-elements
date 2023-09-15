import { MutantStatus, MutationTestResult } from "mutation-testing-report-schema";
import { MutationTestMetricsResult } from "./mutation-test-metrics-result";
import { MetricsResult } from "./metrics-result";
import { FileUnderTestModel, MutantModel, TestFileModel, TestMetrics, TestStatus } from ".";
import { MutationMetrics } from "./mutation-metrics";
import { normalize } from "../helpers";

// const DEFAULT_SCORE = NaN;
const ROOT_NAME = 'All files';
const ROOT_NAME_TESTS = 'All tests';

export function generateRootModel(report: MutationTestResult): MutationTestMetricsResult {
  const projectRoot = report.projectRoot ?? '';
  const fileModelsUnderTest = normalize(report.files, projectRoot, (input, name) => new FileUnderTestModel(input, filenameOnly(name)))

  const result = {
    systemUnderTestMetrics: generateSystemUnderTestMetrics(fileModelsUnderTest),
    testMetrics: generateTestMetrics(report, fileModelsUnderTest),
  }

  console.log(result)
  return result;
}

function generateTestMetrics(report: MutationTestResult, fileModelsUnderTest: Record<string, FileUnderTestModel>): MetricsResult<TestFileModel, TestMetrics> | undefined {
  const { testFiles, projectRoot = '' } = report;
  if (!testFiles) {
    return undefined;
  }

  const testFileModels = normalize(testFiles, projectRoot, (input, name) => new TestFileModel(input, name));
  console.log(testFileModels, fileModelsUnderTest)
  // relate(
  //   Object.values(fileModelsUnderTest).flatMap((file) => file.mutants),
  //   Object.values(testFileModels).flatMap((file) => file.tests),
  // );

  const a = Object.entries(testFileModels).map(([name, file]) => new MetricsResult<TestFileModel, TestMetrics>(name, [], (k) => countTestFileMetrics([k.file!]), file))

  const metric = new MetricsResult<TestFileModel, TestMetrics>(ROOT_NAME_TESTS, a, (k) => {
    console.log(k.file)
    return countTestFileMetrics([k.file!])
  }, Object.values(testFileModels)[0]);

  console.log(metric)

  return metric;
}

type Folders = Record<string, { parent: string, name: string, childs: MetricsResult[] }>;
function generateSystemUnderTestMetrics(files: Record<string, FileUnderTestModel>): MetricsResult<FileUnderTestModel, MutationMetrics> {
  const folders: Folders = {};

  Object.entries(files).forEach(([name, file]) => {
    // create a file for each file
    const metricFile = new MetricsResult(file.name, [], (k) => countFileMetrics(k.file?.mutants || []), file)
    file.result = metricFile;
    const folderNames = name.split('/').slice(0, -1);

    folderNames.forEach((folderName, index) => {
      const folderPath = folderNames.slice(0, index + 1).join('/');

      if (!folders[folderPath]) {
        folders[folderPath] = {
          parent: folderNames.slice(0, index).join('/'),
          name: folderName,
          childs: [metricFile]
        };
      } else {
        folders[folderPath].childs.push(metricFile);
      }
    })
  });

  const metrics = Object.entries(folders).map(([folderPath, folder]) => {
    return new MetricsResult(folderPath, folder.childs, (k) => countFolderMetric(k))
  });

  metrics.forEach(metric => { metric.setParent() })
  const rootMetrics = metrics.filter(m => m.parent === undefined);

  const res = new MetricsResult(ROOT_NAME, rootMetrics, (k) => countFolderMetric(k));
  return res;
}

function filenameOnly(filename: string): string {
  return filename.split('/').pop()!;
}

const DEFAULT_SCORE = NaN;

function countFolderMetric(metric: MetricsResult): MutationMetrics {
  metric.childResults.reduce((acc, curr) => acc + curr.metrics.killed, 0)
  const count = (status: keyof MutationMetrics) => metric.childResults.reduce((acc, curr) => acc + curr.metrics[status], 0);
  const pending = count('pending');
  const killed = count('killed');
  const timeout = count('timeout');
  const survived = count('survived');
  const noCoverage = count('noCoverage');
  const runtimeErrors = count('runtimeErrors');
  const compileErrors = count('compileErrors');
  const ignored = count('ignored');
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

function countFileMetrics(mutants: MutantModel[]): MutationMetrics {
  const count = (status: MutantStatus) => mutants.filter((_) => _.status === status).length;
  const pending = count(MutantStatus.Pending);
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

// function relate(mutants: MutantModel[], tests: TestModel[]) {
//   // Create a testId -> TestModel map for fast lookup
//   const testMap = new Map<string, TestModel>(tests.map((test) => [test.id, test]));

//   for (const mutant of mutants) {
//     const coveringTests = mutant.coveredBy?.map((testId) => testMap.get(testId)) ?? [];
//     for (const test of coveringTests) {
//       if (test) {
//         mutant.addCoveredBy(test);
//         test.addCovered(mutant);
//       }
//     }
//     const killingTests = mutant.killedBy?.map((testId) => testMap.get(testId)) ?? [];
//     for (const test of killingTests) {
//       if (test) {
//         mutant.addKilledBy(test);
//         test.addKilled(mutant);
//       }
//     }
//   }
// }

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