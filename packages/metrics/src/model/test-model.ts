import type { OpenEndLocation, TestDefinition } from 'mutation-testing-report-schema';

import type { MutantModel } from './mutant-model.js';
import type { TestFileModel } from './test-file-model.js';

function assertSourceFileDefined(sourceFile: TestFileModel | undefined): asserts sourceFile {
  if (sourceFile === undefined) {
    throw new Error('test.sourceFile was not defined');
  }
}
function assertLocationDefined(location: OpenEndLocation | undefined): asserts location {
  if (location === undefined) {
    throw new Error('test.location was not defined');
  }
}

export const TestStatus = {
  Killing: 'Killing',
  Covering: 'Covering',
  NotCovering: 'NotCovering',
} as const;
export type TestStatus = keyof typeof TestStatus;

export class TestModel implements TestDefinition {
  public id!: string;
  public name!: string;
  public location?: OpenEndLocation | undefined;

  get killedMutants(): MutantModel[] | undefined {
    if (this.#killedMutants?.length) {
      return [...this.#killedMutants];
    } else return undefined;
  }

  get coveredMutants(): MutantModel[] | undefined {
    if (this.#coveredMutants?.length) {
      return [...this.#coveredMutants];
    } else return undefined;
  }
  declare public sourceFile: TestFileModel | undefined;

  #killedMutants: MutantModel[] | undefined;
  #coveredMutants: MutantModel[] | undefined;

  public addCovered(mutant: MutantModel) {
    this.#coveredMutants ??= [];
    if (!this.#coveredMutants.some(({ id }) => id === mutant.id)) {
      this.#coveredMutants.push(mutant);
    }
  }

  /**
   * Adds a covered mutant without checking whether it was already added.
   * @internal Fast path for `relate()`, which skips the duplicate check: the relationships in a
   * report are unique already, and checking for duplicates is too expensive when relating millions
   * of mutant-test pairs. Use {@link addCovered} instead, which is safe to call more than once
   * with the same mutant.
   */
  public addCoveredUnchecked(mutant: MutantModel) {
    (this.#coveredMutants ??= []).push(mutant);
  }

  public addKilled(mutant: MutantModel) {
    this.#killedMutants ??= [];
    if (!this.#killedMutants.some(({ id }) => id === mutant.id)) {
      this.#killedMutants.push(mutant);
    }
  }

  /**
   * Adds a killed mutant without checking whether it was already added.
   * @internal Fast path for `relate()`, see {@link addCoveredUnchecked}.
   */
  public addKilledUnchecked(mutant: MutantModel) {
    (this.#killedMutants ??= []).push(mutant);
  }

  constructor(input: TestDefinition) {
    Object.entries(input).forEach(([key, value]) => {
      // @ts-expect-error dynamic assignment so we won't forget to add new properties
      this[key] = value;
    });
  }

  /**
   * Retrieves the original source lines where this test is defined.
   * @throws if source file or location is not defined
   */
  public getLines(): string {
    assertSourceFileDefined(this.sourceFile);
    assertLocationDefined(this.location);
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

  public get status(): TestStatus {
    if (this.#killedMutants?.length) {
      return TestStatus.Killing;
    } else if (this.#coveredMutants?.length) {
      return TestStatus.Covering;
    } else {
      return TestStatus.NotCovering;
    }
  }

  public update(): void {
    if (!this.sourceFile?.result?.file) {
      return;
    }
    this.sourceFile.result.updateAllMetrics();
  }
}
