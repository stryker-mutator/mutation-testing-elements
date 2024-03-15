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

export enum TestStatus {
  Killing = 'Killing',
  Covering = 'Covering',
  NotCovering = 'NotCovering',
}

export class TestModel implements TestDefinition {
  public id!: string;
  public name!: string;
  public location?: OpenEndLocation | undefined;

  #killedMutants?: MutantModel[];
  get killedMutants() {
    if (!this.#killedMutants && this.#killedMutantMyId.size) {
      this.#killedMutants = Array.from(this.#killedMutantMyId.values());
    }
    return this.#killedMutants;
  }

  #coveredMutants?: MutantModel[];
  get coveredMutants() {
    if (!this.#coveredMutants && this.#coveredMutantById.size) {
      this.#coveredMutants = Array.from(this.#coveredMutantById.values());
    }
    return this.#coveredMutants;
  }
  public declare sourceFile: TestFileModel | undefined;

  #killedMutantMyId = new Map<string, MutantModel>();
  #coveredMutantById = new Map<string, MutantModel>();

  public addCovered(mutant: MutantModel) {
    this.#coveredMutantById.set(mutant.id, mutant);
    this.#coveredMutants = undefined; // invalidate cache
    this.#invalidateMetrics();
  }

  public addKilled(mutant: MutantModel) {
    this.#killedMutantMyId.set(mutant.id, mutant);
    this.#killedMutants = undefined; // invalidate cache
    this.#invalidateMetrics();
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
    if (this.#killedMutantMyId.size) {
      return TestStatus.Killing;
    } else if (this.#coveredMutantById.size) {
      return TestStatus.Covering;
    } else {
      return TestStatus.NotCovering;
    }
  }

  #invalidateMetrics() {
    this.sourceFile?.result?.invalidate();
  }

  // public update(): void {
  //   if (!this.sourceFile?.result?.file) {
  //     return;
  //   }
  //   this.sourceFile.result.updateAllMetrics();
  // }
}
