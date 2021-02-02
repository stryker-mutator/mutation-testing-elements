import { Location, MutantResult, MutantStatus } from 'mutation-testing-report-schema';
import { TestModel } from './test-model';

/**
 * Represent a model of a mutant that contains its test relationship
 */
export class MutantModel implements MutantResult {
  public coveredByTests: TestModel[] | undefined;
  public killedByTests: TestModel[] | undefined;
  public coveredBy: string[] | undefined;
  public description: string | undefined;
  public duration: number | undefined;
  public id!: string;
  public killedBy: string[] | undefined;
  public location!: Location;
  public mutatorName!: string;
  public replacement: string | undefined;
  public static: boolean | undefined;
  public status!: MutantStatus;
  public testsCompleted: number | undefined;

  constructor(input: MutantResult) {
    Object.entries(input).forEach(([key, value]) => {
      // @ts-expect-error dynamic assignment so we won't forget to add new properties
      this[key] = value;
    });
  }

  public addCoveredBy(test: TestModel) {
    if (!this.coveredByTests) {
      this.coveredByTests = [];
    }
    this.coveredByTests.push(test);
  }

  public addKilledBy(test: TestModel) {
    if (!this.killedByTests) {
      this.killedByTests = [];
    }
    this.killedByTests.push(test);
  }
}
