import type { FileUnderTestModel } from '../model/file-under-test-model.js';
import type { Metrics } from '../model/metrics.js';
import type { MetricsResult } from '../model/metrics-result.js';

const SEPARATOR = '/';

export function normalizeFileNames<TIn>(input: Record<string, TIn>, projectRoot = ''): Record<string, TIn> {
  return normalize(input, projectRoot, (input) => input);
}

export function normalize<TIn, TOut>(
  input: Record<string, TIn>,
  projectRoot: string,
  factory: (input: TIn, relativeFileName: string) => TOut,
): Record<string, TOut> {
  const fileNames = Object.keys(input);
  const commonBasePath = determineCommonBasePath(fileNames);
  const output: Record<string, TOut> = Object.create(null);
  fileNames.forEach((fileName) => {
    const relativeFileName = normalizeName(fileName.startsWith(projectRoot) ? fileName.substr(projectRoot.length) : fileName);
    output[normalizeName(fileName.substr(commonBasePath.length))] = factory(input[fileName], relativeFileName);
  });
  return output;
}

function normalizeName(fileName: string) {
  return fileName.split(/\/|\\/).filter(Boolean).join('/');
}

export function determineCommonBasePath(fileNames: readonly string[]): string {
  const directories = fileNames.map((fileName) => fileName.split(/\/|\\/).slice(0, -1));
  if (fileNames.length) {
    return directories.reduce(filterDirectories).join(SEPARATOR);
  } else {
    return '';
  }

  function filterDirectories(previousDirectories: string[], currentDirectories: string[]) {
    for (let i = 0; i < previousDirectories.length; i++) {
      if (previousDirectories[i] !== currentDirectories[i]) {
        return previousDirectories.splice(0, i);
      }
    }

    return previousDirectories;
  }
}

export function compareNames<TFile = FileUnderTestModel, TMetrics = Metrics>(a: MetricsResult<TFile, TMetrics>, b: MetricsResult<TFile, TMetrics>) {
  const sortValue = (metricsResult: MetricsResult<TFile, TMetrics>) => {
    // Directories first
    if (metricsResult.file) {
      return `1${metricsResult.name}`;
    } else {
      return `0${metricsResult.name}`;
    }
  };
  return sortValue(a).localeCompare(sortValue(b));
}
