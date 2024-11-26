import type { FileResult, MutantResult } from 'mutation-testing-report-schema';

import type { MetricsResult } from './metrics-result.js';
import { MutantModel } from './mutant-model.js';
import { SourceFile } from './source-file.js';

/**
 * Represents a file which was mutated (your production code).
 */
export class FileUnderTestModel extends SourceFile implements FileResult {
  /**
   * Programming language that is used. Used for code highlighting, see https://prismjs.com/#examples.
   */
  language: string;
  /**
   * Full source code of the mutated file, this is used for highlighting.
   */
  source: string;
  /**
   * The mutants inside this file.
   */
  mutants: MutantModel[];
  /**
   * The associated MetricsResult of this file.
   */
  result?: MetricsResult;

  /**
   * @param input The file result content
   * @param name The file name
   */
  constructor(
    input: FileResult,
    public name: string,
  ) {
    super();
    this.language = input.language;
    this.source = input.source;
    this.mutants = input.mutants.map((mutantResult) => {
      const mutant = new MutantModel(mutantResult);
      mutant.sourceFile = this;
      return mutant;
    });
  }

  /**
   * Retrieves the lines of code with the mutant applied to it, to be shown in a diff view.
   */
  public getMutationLines(mutant: MutantResult): string {
    const lineMap = this.getLineMap();
    const start = lineMap[mutant.location.start.line];
    const startOfEndLine = lineMap[mutant.location.end.line];
    const end = lineMap[mutant.location.end.line + 1];
    return `${this.source.substr(start, mutant.location.start.column - 1)}${
      mutant.replacement ?? mutant.description ?? mutant.mutatorName
    }${this.source.substring(startOfEndLine + mutant.location.end.column - 1, end)}`;
  }
}
