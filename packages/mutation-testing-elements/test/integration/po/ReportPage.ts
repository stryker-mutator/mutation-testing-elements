import { constants } from '../lib/constants';
import Breadcrumb from './Breadcrumb.po';
import { getCurrent } from '../lib/browser';
import { ElementSelector } from './ElementSelector.po';
import { Legend } from './Legend.po';
import { MutantComponent } from './MutantComponent.po';
import { ResultTable } from './ResultTable.po';
import { shadowRoot } from '../lib/helpers';

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

  public async breadcrumb(): Promise<Breadcrumb> {
    const host = await this.$('mutation-test-report-app >>> mutation-test-report-breadcrumb');
    return new Breadcrumb(await shadowRoot(host));
  }

  public async mutants(): Promise<MutantComponent[]> {
    return Promise.all((await this.$$('mutation-test-report-app >>> mutation-test-report-file >>> mutation-test-report-mutant'))
      .map(async host => new MutantComponent(await shadowRoot(host))));
  }

  public async mutant(mutantId: number) {
    return new MutantComponent(await shadowRoot(await this.$(`mutation-test-report-app >>> mutation-test-report-file >>> mutation-test-report-mutant[mutant-id="${mutantId}"]`)));
  }

  public async legend() {
    return new Legend(await shadowRoot(await this.$('mutation-test-report-app >>> mutation-test-report-file >>> mutation-test-report-file-legend')));
  }

  public async resultTable() {
    return new ResultTable(await shadowRoot(await this.$('mutation-test-report-app >>> mutation-test-report-totals')));
  }
}
