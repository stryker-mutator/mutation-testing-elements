import { PageObject } from './PageObject.po';
import { MutantStatus } from 'mutation-testing-report-schema/api';
import { TestStatus } from 'mutation-testing-metrics';
import { StateFilterCheckbox } from './StateFilterCheckbox.po';

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
}
