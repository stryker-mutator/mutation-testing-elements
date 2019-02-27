import { TotalsModel } from './TotalsModel';

export abstract class ResultModel {

  constructor(
    public readonly name: string,
    public readonly path: string,
    public readonly totals: TotalsModel) { }

  public abstract readonly representsFile: boolean;
  public abstract find(path: string): ResultModel | undefined;
}
