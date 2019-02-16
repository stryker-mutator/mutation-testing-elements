import { MutationTestResult } from './MutationTestResult';

export interface DirectoryResult extends MutationTestResult {
  childResults: MutationTestResult[];
}
