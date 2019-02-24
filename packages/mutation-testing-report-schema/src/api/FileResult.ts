import { MutantResult } from './MutantResult';

export declare interface FileResult {
  source: string;
  language: string;
  mutants: MutantResult[];
}

export declare interface FileResultDictionary {
  [name: string]: FileResult;
}
