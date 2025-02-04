import { TestStatus } from 'mutation-testing-metrics';

import { PageObject } from './PageObject.po.js';

const allTestStates = Object.values(TestStatus) as TestStatus[];

export class TestDot extends PageObject {
  public toggle() {
    return this.host.click();
  }

  private async classes(): Promise<string[]> {
    return (await this.host.getAttribute('class'))?.split(' ') ?? [];
  }

  public async getStatus(): Promise<TestStatus | undefined> {
    return (await this.classes()).find((clazz) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      const testState = allTestStates.find((state) => state === clazz);
      if (testState) {
        return testState;
      }
      return;
    }) as TestStatus | undefined;
  }

  public async isActive(): Promise<boolean> {
    const classes = await this.classes();
    return classes.includes('selected');
  }
}
