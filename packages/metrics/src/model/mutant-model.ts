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
    return this.#resolveTests(this.coveredBy);
  }
  set coveredByTests(tests: TestModel[]) {
    this.coveredBy = tests.map((test) => test.id);
    tests.forEach((test) => this.#relateTest(test));
  }

  get killedByTests(): TestModel[] | undefined {
    return this.#resolveTests(this.killedBy);
  }
  set killedByTests(tests: TestModel[]) {
    this.killedBy = tests.map((test) => test.id);
    tests.forEach((test) => this.#relateTest(test));
  }
  declare public sourceFile: FileUnderTestModel | undefined;

  /**
   * The tests of the report, keyed by id, used to resolve `coveredByTests`/`killedByTests` lazily.
   * This map is shared with the other mutants in the report.
   */
  #relatedTests: Map<string, TestModel> | undefined;

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

  /**
   * Relates this mutant to the tests in the report (by id).
   * @internal Called by `relate()` during `calculateMutationTestMetrics`. The tests are resolved
   * lazily from `coveredBy`/`killedBy`, so the (potentially millions of) mutant-test relationships
   * don't have to be stored in memory for large reports. The map is shared between all mutants of
   * the report.
   */
  public relateTests(tests: Map<string, TestModel>) {
    this.#relatedTests = tests;
  }

  public addCoveredBy(test: TestModel) {
    this.#relateTest(test);
    this.coveredBy ??= [];
    if (!this.coveredBy.includes(test.id)) {
      this.coveredBy.push(test.id);
    }
  }

  public addKilledBy(test: TestModel) {
    this.#relateTest(test);
    this.killedBy ??= [];
    if (!this.killedBy.includes(test.id)) {
      this.killedBy.push(test.id);
    }
  }

  #relateTest(test: TestModel) {
    (this.#relatedTests ??= new Map()).set(test.id, test);
  }

  #resolveTests(ids: string[] | undefined): TestModel[] | undefined {
    if (!ids?.length || !this.#relatedTests?.size) {
      return undefined;
    }
    const tests: TestModel[] = [];
    const seen = new Set<string>();
    for (const id of ids) {
      if (!seen.has(id)) {
        seen.add(id);
        const test = this.#relatedTests.get(id);
        if (test) {
          tests.push(test);
        }
      }
    }
    return tests.length ? tests : undefined;
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
