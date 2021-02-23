import { FileResult, MutantResult } from 'mutation-testing-report-schema';
import { MutantModel } from './mutant-model';
import { assertSourceDefined, SourceFile } from './source-file';

/**
 * Represents a file which was mutated (your production code).
 */
export class FileUnderTestModel extends SourceFile implements FileResult {
  /**
   * Programming language that is used. Used for code highlighting, see https://prismjs.com/#examples.
   */
  language!: string;
  /**
   * Full source code of the mutated file, this is used for highlighting.
   */
  source!: string;
  /**
   * The mutants inside this file.
   */
  mutants: MutantModel[];

  constructor(input: FileResult) {
    super();
    Object.entries(input).forEach(([key, value]) => {
      // @ts-expect-error dynamic assignment so we won't forget to add new properties
      this[key] = value;
    });
    this.mutants = input.mutants.map((mutantResult) => {
      const mutant = new MutantModel(mutantResult);
      mutant.sourceFile = this;
      return mutant;
    });
  }

  public getMutationLines(mutant: MutantResult): string {
    assertSourceDefined(this.source);
    const lineMap = this.getLineMap();
    const start = lineMap[mutant.location.start.line];
    const startOfEndLine = lineMap[mutant.location.end.line];
    const end = lineMap[mutant.location.end.line + 1];
    return `${this.source.substr(start, mutant.location.start.column - 1)}${
      mutant.replacement ?? mutant.description ?? mutant.mutatorName
    }${this.source.substring(startOfEndLine + mutant.location.end.column - 1, end)}`;
  }
}
