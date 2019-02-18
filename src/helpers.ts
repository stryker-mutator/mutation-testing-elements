import { MutationTestResult } from './api/MutationTestResult';
import { DirectoryResult } from './api/DirectoryResult';
import { FileResult, MutantStatus } from './api';

export function isDirectoryResult(result: MutationTestResult | undefined): result is DirectoryResult {
  return Boolean(result && (result as DirectoryResult).childResults);
}

export function isFileResult(result: MutationTestResult | undefined): result is FileResult {
  return Boolean(result && (result as FileResult).mutants);
}

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
