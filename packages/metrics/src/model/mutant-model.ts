import type { Location, MutantResult, MutantStatus } from 'mutation-testing-report-schema';
import type { FileUnderTestModel } from './file-under-test-model.js';
import type { TestModel } from './test-model.js';

function assertSourceFileDefined(sourceFile: FileUnderTestModel | undefined): asserts sourceFile {
  if (sourceFile === undefined) {
    throw new Error('mutant.sourceFile was not defined');
  }
}

/**
 * Represent a model of a mutant that contains its test relationship
 */
export class MutantModel implements MutantResult {
  // MutantResult properties
  public description: string | undefined;
  public duration: number | undefined;
  public id: string;
  public location: Location;
  public mutatorName: string;
  public replacement: string | undefined;
  public static: boolean | undefined;
  public status: MutantStatus;
  public statusReason: string | undefined;
  public testsCompleted: number | undefined;

  #coveredByTests?: TestModel[];
  get coveredByTests(): TestModel[] | undefined {
    if (!this.#coveredByTests && this.#coveredByTestsById.size) {
      this.#coveredByTests = Array.from(this.#coveredByTestsById.values());
    }
    return this.#coveredByTests;
  }

  #killedByTests?: TestModel[];
  get killedByTests(): TestModel[] | undefined {
    if (!this.#killedByTests && this.#killedByTestsById.size) {
      this.#killedByTests = Array.from(this.#killedByTestsById.values());
    }
    return this.#killedByTests;
  }

  #coveredBy?: string[];
  public get coveredBy() {
    if (!this.#coveredBy && this.#coveredByTestsById) {
      this.#coveredBy = Array.from(this.#coveredByTestsById.keys());
    }
    return this.#coveredBy;
  }

  #killedBy?: string[];
  public get killedBy() {
    if (!this.#killedBy && this.#killedByTestsById) {
      this.#killedBy = Array.from(this.#killedByTestsById.keys());
    }
    return this.#killedBy;
  }

  public declare sourceFile: FileUnderTestModel | undefined;

  #coveredByTestsById = new Map<string, TestModel>();
  #killedByTestsById = new Map<string, TestModel>();

  constructor(input: MutantResult) {
    this.description = input.description;
    this.duration = input.duration;
    this.id = input.id;
    this.#coveredBy = input.coveredBy;
    this.#killedBy = input.killedBy;
    this.location = input.location;
    this.mutatorName = input.mutatorName;
    this.replacement = input.replacement;
    this.static = input.static;
    this.status = input.status;
    this.statusReason = input.statusReason;
    this.testsCompleted = input.testsCompleted;
  }

  public addCoveredBy(test: TestModel) {
    this.#coveredByTestsById.set(test.id, test);
    // invalidate cache
    this.#coveredBy = undefined; 
    this.#coveredByTests = undefined;
  }

  public addKilledBy(test: TestModel) {
    this.#killedByTestsById.set(test.id, test);
    // invalidate cache
    this.#killedBy = undefined;
    this.#killedByTests = undefined;
  }

  /**
   * Retrieves the lines of code with the mutant applied to it, to be shown in a diff view.
   */
  public getMutatedLines() {
    assertSourceFileDefined(this.sourceFile);
    return this.sourceFile.getMutationLines(this);
  }

  /**
   * Retrieves the original source lines for this mutant, to be shown in a diff view.
   */
  public getOriginalLines() {
    assertSourceFileDefined(this.sourceFile);
    return this.sourceFile.getLines(this.location);
  }

  /**
   * Helper property to retrieve the source file name
   * @throws When the `sourceFile` is not defined.
   */
  public get fileName() {
    assertSourceFileDefined(this.sourceFile);
    return this.sourceFile.name;
  }
}
