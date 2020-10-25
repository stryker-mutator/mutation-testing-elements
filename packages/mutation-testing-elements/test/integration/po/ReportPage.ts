import { constants } from '../lib/constants';
import Breadcrumb from './Breadcrumb.po';
import { ElementSelector } from './ElementSelector.po';
import { Legend } from './Legend.po';
import { MutantComponent } from './MutantComponent.po';
import { ResultTable } from './ResultTable.po';
import { selectShadowRoot } from '../lib/helpers';
import { WebDriver } from 'selenium-webdriver';
import { ThemeSelector } from './ThemeSelector.po';

export class ReportPage extends ElementSelector {
  constructor(private readonly browser: WebDriver) {
    super(browser);
  }

  public navigateTo(path: string) {
    return this.browser.get(constants.BASE_URL + path);
  }

  public async backgroundColor() {
    const element = await this.$('mutation-test-report-app >>> .container-fluid');
    return element.getCssValue('background-color');
  }

  public title() {
    return this.browser.getTitle();
  }

  public breadcrumb(): Breadcrumb {
    const host = this.$('mutation-test-report-app >>> mutation-test-report-breadcrumb');
    return new Breadcrumb(selectShadowRoot(host), this.browser);
  }

  public get themeSelector(): ThemeSelector {
    return new ThemeSelector(selectShadowRoot(this.$('mutation-test-report-app >>> mutation-test-report-theme-switch')), this.browser);
  }

  public clickOnCode() {
    return this.$('mutation-test-report-app >>> mutation-test-report-file >>> code').click();
  }

  public async isCodeHighlighted(): Promise<boolean> {
    return this.isPresent('mutation-test-report-app >>> mutation-test-report-file >>> code span.token');
  }

  public async codeBackgroundColor(): Promise<string> {
    const codeElement = await this.$('mutation-test-report-app >>> mutation-test-report-file >>> pre');
    return codeElement.getCssValue('background-color');
  }

  public async mutants(): Promise<MutantComponent[]> {
    return Promise.all(
      (await this.$$('mutation-test-report-app >>> mutation-test-report-file >>> mutation-test-report-mutant')).map(
        async (host) => new MutantComponent(await selectShadowRoot(host), this.browser)
      )
    );
  }

  public mutant(mutantId: number | string) {
    const shadowRoot = selectShadowRoot(
      this.$(`mutation-test-report-app >>> mutation-test-report-file >>> mutation-test-report-mutant[mutant-id="${mutantId}"]`)
    );
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
