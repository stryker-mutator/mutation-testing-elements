import { FileResult } from 'mutation-testing-report-schema';
import { MutantModel } from './mutant-model';

/**
 * Represents a file which was mutated (your production code).
 */
export class FileUnderTestModel implements FileResult {
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
    Object.entries(input).forEach(([key, value]) => {
      if (key !== 'mutants') {
        // @ts-expect-error dynamic assignment so we won't forget to add new properties
        this[key] = value;
      }
    });
    this.mutants = input.mutants.map((mutant) => new MutantModel(mutant));
  }
}
