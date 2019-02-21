import { MutationResultHealth } from './MutationResultHealth';
import { FileResult, FileResultDictionary } from './FileResult';
import { Thresholds } from './Thresholds';

export declare interface MutationTestResult {
  schemaVersion: string;
  thresholds: Thresholds;
  files: FileResultDictionary;
}
