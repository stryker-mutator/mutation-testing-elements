import { Location } from './Location';

export interface MutantResult {
  id: string;
  mutatorName: string;
  replacement: string;
  location: Location;
  status: MutantStatus;
}

export const enum MutantStatus {
  Killed = 'killed',
  Survived = 'survived',
  NoCoverage = 'noCoverage',
  CompileError = 'compileError',
  RuntimeError = 'runtimeError',
  Timeout = 'timeout'
}
