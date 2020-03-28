import { PageObject } from './PageObject.po';
import { MutantStatus } from 'mutation-testing-report-schema';
import { Checkbox } from './Checkbox.po';

export class Legend extends PageObject {
  public displayButton(mutantState: MutantStatus): Checkbox {
    return new Checkbox(this.$(`input[value="${mutantState}"]`), this.browser);
  }
}
