import { MutantStatus } from 'mutation-testing-report-schema';
import { isElementVisible } from '../lib/helpers';
import { PageObject } from './PageObject.po';

const allTestStates = Object.values(MutantStatus) as MutantStatus[];

export class MutantDot extends PageObject {
  public toggle() {
    return this.host.click();
  }

  private async classes() {
    return (await this.host.getAttribute('class')).split(' ');
  }

  public async getStatus(): Promise<MutantStatus | undefined> {
    return (await this.classes()).find((clazz) => {
      const testState = allTestStates.find((state) => state === clazz);
      if (testState) {
        return testState;
      }
      return;
    }) as MutantStatus | undefined;
  }

  public async isActive(): Promise<boolean> {
    const classes = await this.classes();
    return classes.includes('selected');
  }

  public isVisible(): Promise<boolean> {
    return isElementVisible(this.host);
  }
}
