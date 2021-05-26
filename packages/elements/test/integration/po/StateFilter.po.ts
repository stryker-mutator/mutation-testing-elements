import { PageObject } from './PageObject.po';
import { MutantStatus } from 'mutation-testing-report-schema/api';
import { TestStatus } from 'mutation-testing-metrics';
import { StateFilterCheckbox } from './StateFilterCheckbox.po';

export class StateFilter extends PageObject {
  public state(state: MutantStatus | TestStatus): StateFilterCheckbox {
    return new StateFilterCheckbox(this.$(`.form-check-inline[data-status="${state}"]`), this.browser);
  }

  public async states() {
    const labels = await this.$$('.form-check-inline');
    return labels.map((label) => new StateFilterCheckbox(label, this.browser));
  }
}
