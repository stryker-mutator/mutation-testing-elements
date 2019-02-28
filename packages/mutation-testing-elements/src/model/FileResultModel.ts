import { ResultModel } from './ResultModel';
import { TotalsModel } from './TotalsModel';
import { MutantResult, FileResult } from 'mutation-testing-report-schema';

export class FileResultModel extends ResultModel {
  public readonly mutants: ReadonlyArray<MutantResult>;
  public readonly source: string;
  public readonly language: string;
  constructor(name: string,
              path: string,
              fileResult: FileResult) {
    super(name, path, new TotalsModel(fileResult.mutants));
    this.mutants = fileResult.mutants;
    this.language = fileResult.language;
    this.source = fileResult.source;
  }
  public readonly representsFile = true;
  public find(_path: string): ResultModel | undefined {
    return this;
  }
}
