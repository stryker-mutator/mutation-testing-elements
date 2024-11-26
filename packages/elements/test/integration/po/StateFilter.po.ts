import type { TestStatus } from 'mutation-testing-metrics';
import type { MutantStatus } from 'mutation-testing-report-schema/api';

import { PageObject } from './PageObject.po.js';
import { StateFilterCheckbox } from './StateFilterCheckbox.po.js';

export class StateFilter extends PageObject {
  public state(state: MutantStatus | TestStatus): StateFilterCheckbox {
    return new StateFilterCheckbox(this.$(`[data-status="${state}"]`), this.browser);
  }

  public previous(): Promise<void> {
    return this.$('button[title=Previous]').click();
  }

  public next(): Promise<void> {
    return this.$('button[title=Next]').click();
  }

  public async states() {
    const labels = await this.$$('[data-status]');
    return labels.map((label) => new StateFilterCheckbox(label, this.browser));
  }

  public get statesLocator() {
    return this.$('[data-status]');
  }
}
