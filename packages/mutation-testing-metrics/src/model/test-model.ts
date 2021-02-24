import { OpenEndLocation, TestDefinition } from 'mutation-testing-report-schema';
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

export class TestModel implements TestDefinition {
  public id!: string;
  public name!: string;
  public location?: OpenEndLocation | undefined;

  public killedMutants?: MutantModel[];
  public coveredMutants?: MutantModel[];
  public sourceFile: TestFileModel | undefined;

  public addCovered(mutant: MutantModel) {
    if (!this.coveredMutants) {
      this.coveredMutants = [];
    }
    this.coveredMutants.push(mutant);
  }

  public addKilled(mutant: MutantModel) {
    if (!this.killedMutants) {
      this.killedMutants = [];
    }
    this.killedMutants.push(mutant);
  }

  constructor(input: TestDefinition) {
    Object.entries(input).forEach(([key, value]) => {
      // @ts-expect-error dynamic assignment so we won't forget to add new properties
      this[key] = value;
    });
  }

  public getLines(): string {
    assertSourceFileDefined(this.sourceFile);
    assertLocationDefined(this.location);
    return this.sourceFile.getLines(this.location);
  }
}
