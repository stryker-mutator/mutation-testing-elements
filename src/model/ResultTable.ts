import { MutantResult, FileResultDictionary, MutantStatus, FileResult } from '../../api';
import { flatMap, ROOT_NAME } from '../helpers';
import { Thresholds } from '../../api/Thresholds';

const DEFAULT_IF_NO_VALID_MUTANTS = 100;

export class TableRow {

  public killed: number;
  public timeout: number;
  public survived: number;
  public noCoverage: number;
  public runtimeErrors: number;
  public compileErrors: number;
  public totalDetected: number;
  public totalUndetected: number;
  public totalCovered: number;
  public totalValid: number;
  public totalInvalid: number;
  public totalMutants: number;
  public mutationScore: number;
  public mutationScoreBasedOnCoveredCode: number;

  constructor(public name: string, results: MutantResult[], public shouldLink: boolean) {
    const count = (mutantResult: MutantStatus) => results.filter(mutant => mutant.status === mutantResult).length;
    this.killed = count(MutantStatus.Killed);
    this.timeout = count(MutantStatus.Timeout);
    this.survived = count(MutantStatus.Survived);
    this.noCoverage = count(MutantStatus.NoCoverage);
    this.runtimeErrors = count(MutantStatus.RuntimeError);
    this.compileErrors = count(MutantStatus.CompileError);

    this.totalDetected = this.timeout + this.killed;
    this.totalUndetected = this.survived + this.noCoverage;
    this.totalCovered = this.totalDetected + this.survived;
    this.totalValid = this.totalUndetected + this.totalDetected;
    this.totalInvalid = this.runtimeErrors + this.compileErrors;
    this.totalMutants = this.totalValid + this.totalInvalid;
    this.mutationScore = this.totalValid > 0 ? this.totalDetected / this.totalValid * 100 : DEFAULT_IF_NO_VALID_MUTANTS;
    this.mutationScoreBasedOnCoveredCode = this.totalValid > 0 ? this.totalDetected / this.totalCovered * 100 || 0 : DEFAULT_IF_NO_VALID_MUTANTS;
  }
}

export class ResultTable {

  constructor(public rows: TableRow[], public thresholds: Thresholds) {}

  public static forFile(name: string, result: FileResult, thresholds: Thresholds) {
    return new ResultTable([
      new TableRow(name, result.mutants, false)
    ], thresholds);
  }
}
