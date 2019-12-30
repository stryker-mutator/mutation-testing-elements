import { MetricsResult } from './api/MetricsResult';
import { FileResultDictionary } from 'mutation-testing-report-schema';
const SEPARATOR = '/';

export function flatMap<T, R>(source: T[], fn: (input: T) => R[]) {
  const result: R[] = [];
  source.map(fn).forEach(items => result.push(...items));
  return result;
}

export function groupBy<T>(arr: T[], criteria: (element: T) => string): Record<string, T[]> {
  return arr.reduce((acc: Record<string, T[]>, item) => {
    const key = criteria(item);
    if (!acc.hasOwnProperty(key)) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
}

export function pathJoin(...parts: string[]) {
  return parts.reduce((prev, current) => prev.length ? current ? `${prev}/${current}` : prev : current, '');
}

export function normalizeFileNames(input: FileResultDictionary): FileResultDictionary {
  const fileNames = Object.keys(input);
  const commonBasePath = determineCommonBasePath(fileNames);
  const output: FileResultDictionary = {};
  fileNames.forEach(fileName => {
    output[normalize(fileName.substr(commonBasePath.length))] = input[fileName];
  });
  return output;
}

function normalize(fileName: string) {
  return fileName.split(/\/|\\/)
    .filter(pathPart => pathPart)
    .join('/');
}

function determineCommonBasePath(fileNames: ReadonlyArray<string>) {
  const directories = fileNames.map(fileName => fileName.split(/\/|\\/).slice(0, -1));
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

export function compareNames(a: MetricsResult, b: MetricsResult) {
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
