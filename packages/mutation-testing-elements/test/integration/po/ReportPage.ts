import { constants } from '../lib/constants';
import Breadcrumb from './Breadcrumb.po';
import { getCurrent } from '../lib/browser';
import { ElementSelector } from './ElementSelector.po';
import { Legend } from './Legend.po';
import { MutantComponent } from './MutantComponent.po';
import { ResultTable } from './ResultTable.po';
import { selectShadowRoot } from '../lib/helpers';

export class ReportPage extends ElementSelector {

  constructor() {
    super(getCurrent());
  }

  public navigateTo(path: string) {
    return getCurrent().get(constants.BASE_URL + path);
  }

  public title() {
    return getCurrent().getTitle();
  }

  public breadcrumb(): Breadcrumb {
    const host = this.$('mutation-test-report-app >>> mutation-test-report-breadcrumb');
    return new Breadcrumb(selectShadowRoot(host));
  }

  public clickOnCode() {
    return this.$('mutation-test-report-app >>> mutation-test-report-file >>> code').click();
  }

  public async mutants(): Promise<MutantComponent[]> {
    return Promise.all((await this.$$('mutation-test-report-app >>> mutation-test-report-file >>> mutation-test-report-mutant'))
      .map(async host => new MutantComponent(await selectShadowRoot(host))));
  }

  public mutant(mutantId: number) {
    return new MutantComponent(selectShadowRoot(
      this.$(`mutation-test-report-app >>> mutation-test-report-file >>> mutation-test-report-mutant[mutant-id="${mutantId}"]`)));
  }

  public legend() {
    return new Legend(selectShadowRoot(this.$('mutation-test-report-app >>> mutation-test-report-file >>> mutation-test-report-file-legend')));
  }

  public resultTable() {
    return new ResultTable(selectShadowRoot(this.$('mutation-test-report-app >>> mutation-test-report-totals')));
  }
}
