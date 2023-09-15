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
  const systemUnderTestMetrics = generateMetrics<FileUnderTestModel, MutationMetrics>(fileModelsUnderTest, generateSystemUnderTestMetric, ROOT_NAME)
  console.clear();

  console.log(report.testFiles)
  const result = {
    systemUnderTestMetrics: systemUnderTestMetrics,
    testMetrics: generateTestMetrics(report),
  }

  console.log(result)
  return result;
}

function generateSystemUnderTestMetric(name: string, childResults: MetricsResult<FileUnderTestModel, MutationMetrics>[], file?: FileUnderTestModel) {
  const metric = new MetricsResult<FileUnderTestModel, MutationMetrics>(name, childResults, generateSystemUnderTestMetricResult, file)

  if (file) {
    file.result = metric;
  }

  return metric
}

function generateSystemUnderTestMetricResult(metric: MetricsResult<FileUnderTestModel, MutationMetrics>) {
  if (metric.file?.mutants) {
    return countFileMetrics(metric.file.mutants)
  }
  return countFolderMetric(metric);
}

function generateTestMetrics(report: MutationTestResult): MetricsResult<TestFileModel, TestMetrics> | undefined {
  const { testFiles, projectRoot = '' } = report;
  if (!testFiles) {
    return undefined;
  }

  const testFileModels = normalize(testFiles, projectRoot, (input, name) => new TestFileModel(input, filenameOnly(name)));
  const metric = generateMetrics<TestFileModel, TestMetrics>(testFileModels, generateTestMetric, ROOT_NAME_TESTS);

  return metric;
}

function generateTestMetric(name: string, childResults: MetricsResult<TestFileModel, TestMetrics>[], file?: TestFileModel) {
  const metric = new MetricsResult<TestFileModel, TestMetrics>(name, childResults, generateTestMetricResult, file)
  if (file) {
    file.result = metric;
  }

  return metric
}

function generateTestMetricResult(metric: MetricsResult<TestFileModel, TestMetrics>): TestMetrics {
  if (metric.file?.tests) {
    const countTestFile = (status: TestStatus) => metric.file!.tests.filter((_) => _.status === status).length;

    return {
      total: metric.file.tests.length,
      killing: countTestFile(TestStatus.Killing),
      covering: countTestFile(TestStatus.Covering),
      notCovering: countTestFile(TestStatus.NotCovering)
    }
  }

  const countDirectory = (prop: keyof TestMetrics) => metric.childResults.reduce((acc, curr) => acc + curr.metrics[prop], 0);

  return {
    total: countDirectory('total'),
    killing: countDirectory('killing'),
    covering: countDirectory('covering'),
    notCovering: countDirectory('notCovering')
  };
}

function generateMetrics<TFile, TMetrics>(
  files: Record<string, TFile>,
  generateMetric: (name: string, childResults: MetricsResult<TFile, TMetrics>[], file?: TFile) => MetricsResult<TFile, TMetrics>,
  rootName: string
): MetricsResult<TFile, TMetrics> {
  type Folders = Record<string, { parent: string, name: string, childs: MetricsResult<TFile, TMetrics>[] }>;
  const folders: Folders = {};

  Object.entries(files).forEach(([name, file]) => {
    // create a file for each file
    const metricFile = generateMetric(name, [], file)
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
    return generateMetric(folderPath, folder.childs)
  });

  metrics.forEach(metric => { metric.setParent() })
  const rootMetrics = metrics.filter(m => m.parent === undefined);
  return generateMetric(rootName, rootMetrics);;
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