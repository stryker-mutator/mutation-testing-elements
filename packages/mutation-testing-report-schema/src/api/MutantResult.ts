import { Location } from './Location';

export interface MutantResult {
  id: string;
  mutatorName: string;
  replacement?: string;
  description?: string;
  location: Location;
  status: MutantStatus;
}

export const enum MutantStatus {
  Killed = 'Killed',
  Survived = 'Survived',
  NoCoverage = 'NoCoverage',
  CompileError = 'CompileError',
  RuntimeError = 'RuntimeError',
  Timeout = 'Timeout'
}
