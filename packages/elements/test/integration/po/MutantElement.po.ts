import { MutantStatus } from 'mutation-testing-report-schema';
import { PageObject } from './PageObject.po';

const allMutantStates = Object.values(MutantStatus) as MutantStatus[];

/**
 * Represents a dom element with a mutant status class mutant-id
 */
export abstract class MutantElement extends PageObject {
  public toggle() {
    return this.host.click();
  }

  protected async classes() {
    return (await this.host.getAttribute('class')).split(' ');
  }

  public async getStatus(): Promise<MutantStatus | undefined> {
    return (await this.classes()).find((clazz) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      const testState = allMutantStates.find((state) => state === clazz);
      if (testState) {
        return testState;
      }
      return;
    }) as MutantStatus | undefined;
  }
  public async mutantId() {
    return this.host.getAttribute('mutant-id');
  }
}
