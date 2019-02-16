import { MutationTestResult } from './MutationTestResult';
import { MutantResult } from './MutantResult';

export interface FileResult extends MutationTestResult {
  source: string;
  language: string;
  mutants: MutantResult[];
}
