import { OpenEndLocation, TestDefinition } from 'mutation-testing-report-schema';
import { MutantModel } from './mutant-model';

export class TestModel implements TestDefinition {
  id!: string;
  name!: string;
  location?: OpenEndLocation | undefined;

  killedMutants?: MutantModel[];
  coveredMutants?: MutantModel[];

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
}
