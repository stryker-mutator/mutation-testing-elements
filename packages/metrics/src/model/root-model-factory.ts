import { MutationTestResult } from "mutation-testing-report-schema";
import { MutationTestMetricsResult } from "./mutation-test-metrics-result";
import { MetricsResult } from "./metrics-result";
import { FileUnderTestModel, MutantModel, TestFileModel, TestMetrics, TestModel } from ".";
import { MutationMetrics } from "./mutation-metrics";
import { normalize } from "../helpers";
import { countFileMetrics, countDirectoryMetric, countTestFileMetrics } from "./metrics-calculations";

// const DEFAULT_SCORE = NaN;
const ROOT_NAME = 'All files';
const ROOT_NAME_TESTS = 'All tests';

export function generateRootModel(report: MutationTestResult): MutationTestMetricsResult {
  const projectRoot = report.projectRoot ?? '';
  const fileModelsUnderTest = normalize(report.files, projectRoot, (input, name) => new FileUnderTestModel(input, filenameOnly(name)))

  const result = {
    systemUnderTestMetrics: generateMetrics(fileModelsUnderTest, generateSystemUnderTestMetric, ROOT_NAME),
    testMetrics: generateTestMetrics(report, fileModelsUnderTest),
  }

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
  return countDirectoryMetric(metric);
}

export function generateTestMetrics(report: MutationTestResult, fileModelsUnderTest: Record<string, FileUnderTestModel>): MetricsResult<TestFileModel, TestMetrics> | undefined {
  const { testFiles, projectRoot = '' } = report;
  if (!testFiles) {
    return undefined;
  }
  const testFileModels = normalize(testFiles, projectRoot, (input, name) => new TestFileModel(input, filenameOnly(name)));

  relate(
    Object.values(fileModelsUnderTest).flatMap((file) => file.mutants),
    Object.values(testFileModels).flatMap((file) => file.tests),
  );
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
    return countTestFileMetrics(metric.file.tests);
  }

  const countDirectory = (prop: keyof TestMetrics) => metric.childResults.reduce((acc, curr) => acc + curr.metrics[prop], 0);

  return {
    total: countDirectory('total'),
    killing: countDirectory('killing'),
    covering: countDirectory('covering'),
    notCovering: countDirectory('notCovering')
  };
}

export function generateMetrics<TFile, TMetrics>(
  files: Record<string, TFile>,
  generateMetric: (name: string, childResults: MetricsResult<TFile, TMetrics>[], file?: TFile) => MetricsResult<TFile, TMetrics>,
  rootName: string
): MetricsResult<TFile, TMetrics> {
  type Folders = Record<string, { parent: string, name: string, childs: MetricsResult<TFile, TMetrics>[] }>;
  const folders: Folders = {};
  const rootFileMetrics: MetricsResult<TFile, TMetrics>[] = [];

  Object.entries(files).forEach(([name, file]) => {
    // create a file for each file
    // @ts-expect-error
    const metricFile = generateMetric(file.name, [], file)
    const folderNames = name.split('/').slice(0, -1);

    if (folderNames.length === 0) {
      rootFileMetrics.push(metricFile);
      return;
    }

    folderNames.forEach((folderName, index) => {
      const folderPath = folderNames.slice(0, index + 1).join('/');

      if (!folders[folderPath]) {
        folders[folderPath] = {
          parent: folderNames.slice(0, index).join('/'),
          name: folderName,
          childs: []
        };
      }

      if (index === folderNames.length - 1) {
        folders[folderPath].childs.push(metricFile);
      }
    })
  });

  const metrics: [string, MetricsResult<TFile, TMetrics>][] = []

  Object.entries(folders)
    .sort(([folderPath], [folderPath2]) => folderPath.length < folderPath2.length ? 1 : -1)
    .forEach(([folderPath, folder]) => {

      const folderChilds = metrics.filter(([path]) => path.startsWith(folderPath)).map(([_, metric]) => metric);
      const allChilds = [...folderChilds, ...folder.childs];

      const metric = generateMetric(folder.name, allChilds);

      metrics.push([folderPath, metric]);
    });

  metrics.forEach(([_, metric]) => { metric.setParent() })
  const rootMetrics = [
    ...metrics.map(([_, m]) => m).filter(m => m.parent === undefined),
    ...rootFileMetrics
  ];
  return generateMetric(rootName, rootMetrics);;
}

function filenameOnly(filename: string): string {
  return filename.split('/').pop()!;
}

function relate(mutants: MutantModel[], tests: TestModel[]) {
  // Create a testId -> TestModel map for fast lookup
  const testMap = new Map<string, TestModel>(tests.map((test) => [test.id, test]));

  for (const mutant of mutants) {
    const coveringTests = mutant.coveredBy?.map((testId) => testMap.get(testId)) ?? [];
    for (const test of coveringTests) {
      if (test) {
        mutant.addCoveredBy(test);
        test.addCovered(mutant);
      }
    }
    const killingTests = mutant.killedBy?.map((testId) => testMap.get(testId)) ?? [];
    for (const test of killingTests) {
      if (test) {
        mutant.addKilledBy(test);
        test.addKilled(mutant);
      }
    }
  }
}