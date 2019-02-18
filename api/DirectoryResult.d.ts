import { MutationTestResult } from './MutationTestResult';

export declare interface DirectoryResult extends MutationTestResult {
  childResults: MutationTestResult[];
}
