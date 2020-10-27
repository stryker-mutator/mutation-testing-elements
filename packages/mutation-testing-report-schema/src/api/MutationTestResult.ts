import { FileResultDictionary } from './FileResult';
import { Thresholds } from './Thresholds';

export interface MutationTestResult {
  schemaVersion: string;
  projectRoot: string;
  thresholds: Thresholds;
  files: FileResultDictionary;
}
