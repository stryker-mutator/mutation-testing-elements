import { Location, MutantResult, MutantStatus } from 'mutation-testing-report-schema/api';
import { FileUnderTestModel } from './file-under-test-model';
import { TestModel } from './test-model';

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
  #status: MutantStatus;
  get status() {
    return this.#status;
  }
  set status(value: MutantStatus) {
    this.sourceFile?.result?.invalidateMetrics();
    this.#status = value;
  }
  public statusReason: string | undefined;
  public testsCompleted: number | undefined;

  // New fields
  public coveredByTests: TestModel[] | undefined;
  public killedByTests: TestModel[] | undefined;
  public sourceFile: FileUnderTestModel | undefined;

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
    this.#status = input.status;
    this.statusReason = input.statusReason;
    this.testsCompleted = input.testsCompleted;
  }

  public addCoveredBy(test: TestModel) {
    if (!this.coveredByTests) {
      this.coveredByTests = [];
    }
    if (this.#coveredByTests.has(test.id)) {
      return;
    }
    this.#coveredByTests.set(test.id, test);
    this.coveredByTests?.push(test);
  }

  public addKilledBy(test: TestModel) {
    if (!this.killedByTests) {
      this.killedByTests = [];
    }
    if (this.#killedByTests.has(test.id)) {
      return;
    }

    this.#killedByTests.set(test.id, test);
    this.killedByTests?.push(test);
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
