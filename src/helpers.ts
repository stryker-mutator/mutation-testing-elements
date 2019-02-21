import { MutationTestResult } from '../api/MutationTestResult';
import { FileResult, MutantStatus, FileResultDictionary } from '../api';

export const ROOT_NAME = 'All files';
const SEPARATOR = '/';

export function getContextClassForStatus(status: MutantStatus) {
  switch (status) {
    case MutantStatus.Killed:
      return 'success';
    case MutantStatus.NoCoverage:
    case MutantStatus.Survived:
      return 'danger';
    case MutantStatus.Timeout:
      return 'warning';
    case MutantStatus.RuntimeError:
    case MutantStatus.CompileError:
      return 'secondary';
  }
}

export const COLUMN_START_INDEX = 1;
export const LINE_START_INDEX = 1;
export const NEW_LINE = '\n';
export const CARRIAGE_RETURN = '\r';
export function lines(content: string) {
  return content.split(NEW_LINE).map(line => line.endsWith(CARRIAGE_RETURN) ? line.substr(0, line.length - 1) : line);
}

export function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function flatMap<T, R>(source: T[], fn: (input: T) => R[]) {
  const result: R[] = [];
  source.map(fn).forEach(items => result.push(...items));
  return result;
}

export function normalizeFileNames(files: FileResultDictionary): FileResultDictionary {
  const fileNames = Object.keys(files);
  const commonBasePath = determineCommonBasePath(fileNames);
  const result: FileResultDictionary = {};
  fileNames.forEach(fileName => {
    result[normalize(fileName.substr(commonBasePath.length))] = files[fileName];
  });
  return result;
}

function normalize(fileName: string) {
  return fileName.split(/\/|\\/)
    .filter(pathPart => pathPart)
    .join('/');
}

function determineCommonBasePath(fileNames: string[]) {
  const directories = fileNames.map(fileName => fileName.split(/\/|\\/).slice(0, -1));

  if (directories.length) {
    return directories.reduce(filterDirectories).join(SEPARATOR);
  } else {
    return '';
  }
}

function filterDirectories(previousDirectories: string[], currentDirectories: string[]) {
  for (let i = 0; i < previousDirectories.length; i++) {
    if (previousDirectories[i] !== currentDirectories[i]) {
      return previousDirectories.splice(0, i);
    }
  }

  return previousDirectories;
}
