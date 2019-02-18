import { Location } from './Location';

export declare interface MutantResult {
  id: string;
  mutatorName: string;
  replacement: string;
  location: Location;
  status: MutantStatus;
}

export declare const enum MutantStatus {
  Killed = 'Killed',
  Survived = 'Survived',
  NoCoverage = 'NoCoverage',
  CompileError = 'CompileError',
  RuntimeError = 'RuntimeError',
  Timeout = 'Timeout'
}
