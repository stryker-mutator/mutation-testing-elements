import type { MutantStatus } from 'mutation-testing-report-schema/api';

import { PageObject } from './PageObject.po.js';

const allMutantStates = Object.keys({
  Killed: null,
  Survived: null,
  NoCoverage: null,
  CompileError: null,
  RuntimeError: null,
  Timeout: null,
  Ignored: null,
  Pending: null,
} satisfies Record<MutantStatus, unknown>) as MutantStatus[];

/**
 * Represents a dom element with a mutant status class mutant-id
 */
export abstract class MutantElement extends PageObject {
  public toggle() {
    return this.host.click();
  }

  protected async classes() {
    return (await this.host.getAttribute('class'))?.split(' ') ?? [];
  }

  public async getStatus(): Promise<MutantStatus | undefined> {
    return (await this.classes()).find((clazz) => {
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
