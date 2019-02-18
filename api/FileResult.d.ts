import { MutationTestResult } from './MutationTestResult';
import { MutantResult } from './MutantResult';

export declare interface FileResult extends MutationTestResult {
  source: string;
  language: string;
  mutants: MutantResult[];
}
