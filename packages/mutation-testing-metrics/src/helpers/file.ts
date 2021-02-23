import { MetricsResult } from '../model/metrics-result';
const SEPARATOR = '/';

export function normalizeFileNames<TIn>(input: Record<string, TIn>): Record<string, TIn> {
  return normalize(input, (input) => input);
}

export function normalize<TIn, TOut>(input: Record<string, TIn>, factory: (input: TIn) => TOut): Record<string, TOut> {
  const fileNames = Object.keys(input);
  const commonBasePath = determineCommonBasePath(fileNames);
  const output: Record<string, TOut> = Object.create(null);
  fileNames.forEach((fileName) => {
    output[normalizeName(fileName.substr(commonBasePath.length))] = factory(input[fileName]);
  });
  return output;
}

function normalizeName(fileName: string) {
  return fileName.split(/\/|\\/).filter(Boolean).join('/');
}

function determineCommonBasePath(fileNames: ReadonlyArray<string>): string {
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

export function compareNames(a: MetricsResult<any, any>, b: MetricsResult<any, any>) {
  const sortValue = (metricsResult: MetricsResult) => {
    // Directories first
    if (metricsResult.file) {
      return `1${metricsResult.name}`;
    } else {
      return `0${metricsResult.name}`;
    }
  };
  return sortValue(a).localeCompare(sortValue(b));
}
