import { OpenEndLocation, TestDefinition } from 'mutation-testing-report-schema/api';
import { MutantModel } from './mutant-model';
import { TestFileModel } from './test-file-model';

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

  public killedMutants?: MutantModel[];
  public coveredMutants?: MutantModel[];
  public sourceFile: TestFileModel | undefined;

  private _killedMutants: Map<string, MutantModel> = new Map();
  private _coveredMutants: Map<string, MutantModel> = new Map();

  public addCovered(mutant: MutantModel) {
    if (!this.coveredMutants) {
      this.coveredMutants = [];
    }
    if (this._coveredMutants.has(mutant.id)) {
      return;
    }
    this._coveredMutants.set(mutant.id, mutant);
    this.coveredMutants.push(mutant);
  }

  public addKilled(mutant: MutantModel) {
    if (!this.killedMutants) {
      this.killedMutants = [];
    }
    if (this._killedMutants.has(mutant.id)) {
      return;
    }
    this._killedMutants.set(mutant.id, mutant);
    this.killedMutants.push(mutant);
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
    if (this.killedMutants?.length) {
      return TestStatus.Killing;
    } else if (this.coveredMutants?.length) {
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
