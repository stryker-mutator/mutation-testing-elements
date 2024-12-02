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

  public coveredBy: string[] | undefined;
  public description: string | undefined;
  public duration: number | undefined;
  public id: string;
  public killedBy: string[] | undefined;
  public location: Location;
  public mutatorName: string;
  public replacement: string | undefined;
  public static: boolean | undefined;
  public status: MutantStatus;
  public statusReason: string | undefined;
  public testsCompleted: number | undefined;

  // New fields
  get coveredByTests(): TestModel[] | undefined {
    if (this.#coveredByTests.size) {
      return Array.from(this.#coveredByTests.values());
    } else return undefined;
  }
  set coveredByTests(tests: TestModel[]) {
    this.#coveredByTests = new Map(tests.map((test) => [test.id, test]));
  }

  get killedByTests(): TestModel[] | undefined {
    if (this.#killedByTests.size) {
      return Array.from(this.#killedByTests.values());
    } else return undefined;
  }
  set killedByTests(tests: TestModel[]) {
    this.#killedByTests = new Map(tests.map((test) => [test.id, test]));
  }
  declare public sourceFile: FileUnderTestModel | undefined;

  #coveredByTests = new Map<string, TestModel>();
  #killedByTests = new Map<string, TestModel>();

  constructor(input: MutantResult) {
    this.coveredBy = input.coveredBy;
    this.description = input.description;
    this.duration = input.duration;
    this.id = input.id;
    this.killedBy = input.killedBy;
    this.location = input.location;
    this.mutatorName = input.mutatorName;
    this.replacement = input.replacement;
    this.static = input.static;
    this.status = input.status;
    this.statusReason = input.statusReason;
    this.testsCompleted = input.testsCompleted;
  }

  public addCoveredBy(test: TestModel) {
    this.#coveredByTests.set(test.id, test);
  }

  public addKilledBy(test: TestModel) {
    this.#killedByTests.set(test.id, test);
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

  // TODO: https://github.com/stryker-mutator/mutation-testing-elements/pull/2453#discussion_r1178769871
  public update(): void {
    if (!this.sourceFile?.result?.file) {
      return;
    }
    this.sourceFile.result.updateAllMetrics();
  }
}
