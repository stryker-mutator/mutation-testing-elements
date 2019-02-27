import { ResultModel } from './ResultModel';
import { TotalsModel } from './TotalsModel';
import { MutantResult } from 'mutation-testing-report-schema';

export class FileResultModel extends ResultModel {
  constructor(name: string,
              path: string,
              numbers: TotalsModel,
              public readonly mutants: ReadonlyArray<MutantResult>,
              public readonly source: string,
              public readonly language: string) {
    super(name, path, numbers);
  }
  public readonly representsFile = true;
  public find(_path: string): ResultModel | undefined {
    return this;
  }
}
