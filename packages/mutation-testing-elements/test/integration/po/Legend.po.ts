import { PageObject } from './PageObject.po';
import { MutantStatus } from 'mutation-testing-report-schema';
import { Checkbox } from './Checkbox.po';

export class Legend extends PageObject {

  public async displayButton(mutantState: MutantStatus): Promise<Checkbox> {
    return new Checkbox(await this.$(`input[value="${mutantState}"]`));
  }
}
