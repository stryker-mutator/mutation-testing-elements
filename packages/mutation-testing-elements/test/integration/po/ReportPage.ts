import { constants } from '../lib/constants';
import Breadcrumb from './Breadcrumb.po';
import { getCurrent } from '../lib/browser';
import { ElementSelector } from './ElementSelector.po';
import { Legend } from './Legend.po';
import { MutantComponent } from './MutantComponent.po';
import { ResultTable } from './ResultTable.po';
import { selectShadowRoot } from '../lib/helpers';
import { WebDriver } from 'selenium-webdriver';

export class ReportPage extends ElementSelector {

  constructor(private readonly browser: WebDriver) {
    super(browser);
  }

  public navigateTo(path: string) {
    return getCurrent().get(constants.BASE_URL + path);
  }

  public title() {
    return getCurrent().getTitle();
  }

  public breadcrumb(): Breadcrumb {
    const host = this.$('mutation-test-report-app >>> mutation-test-report-breadcrumb');
    return new Breadcrumb(selectShadowRoot(host), this.browser);
  }

  public clickOnCode() {
    return this.$('mutation-test-report-app >>> mutation-test-report-file >>> code').click();
  }

  public async isCodeHighlighted(): Promise<boolean> {
    return this.isPresent('mutation-test-report-app >>> mutation-test-report-file >>> code span.token');
  }

  public async mutants(): Promise<MutantComponent[]> {
    return Promise.all((await this.$$('mutation-test-report-app >>> mutation-test-report-file >>> mutation-test-report-mutant'))
      .map(async host => new MutantComponent(await selectShadowRoot(host), this.browser)));
  }

  public mutant(mutantId: number | string) {
    const shadowRoot = selectShadowRoot(
      this.$(`mutation-test-report-app >>> mutation-test-report-file >>> mutation-test-report-mutant[mutant-id="${mutantId}"]`));
    return new MutantComponent(shadowRoot, this.browser);
  }

  public legend() {
    const context = selectShadowRoot(this.$('mutation-test-report-app >>> mutation-test-report-file >>> mutation-test-report-file-legend'));
    return new Legend(context, this.browser);
  }

  public resultTable() {
    const context = selectShadowRoot(this.$('mutation-test-report-app >>> mutation-test-report-totals'));
    return new ResultTable(context, this.browser);
  }
}
