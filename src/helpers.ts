import { MutationTestResult } from './api/MutationTestResult';
import { DirectoryResult } from './api/DirectoryResult';
import { FileResult } from './api';

export function isDirectoryResult(result: MutationTestResult | undefined): result is DirectoryResult {
  return Boolean(result && (result as DirectoryResult).childResults);
}

export function isFileResult(result: MutationTestResult | undefined): result is FileResult {
  return Boolean(result && (result as FileResult).mutants);
}
