import { ResultModel } from './ResultModel';
import { TotalsModel } from './TotalsModel';
import { FileResultModel } from './FileResultModel';

export class DirectoryResultModel extends ResultModel {

  constructor(name: string,
              path: string,
              numbers: TotalsModel,
              public readonly childResults: ReadonlyArray<DirectoryResultModel | FileResultModel>) {
    super(name, path, numbers);
  }
  public readonly representsFile = false;

  public find(path: string): ResultModel | undefined {
    if (path === this.path) {
      return this;
    } else if (path.startsWith(this.path)) {
      const child = this.childResults.find(child => path.startsWith(child.path));
      if (child) {
        return child.find(path);
      }
    }
    return undefined;
  }
}
