import { FileResultDictionary } from './FileResult';
import { Thresholds } from './Thresholds';

export interface MutationTestResult {
  schemaVersion: string;
  thresholds: Thresholds;
  files: FileResultDictionary;
}
