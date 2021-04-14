import { constants, DEFAULT_TIMEOUT } from '../lib/constants';
import Breadcrumb from './Breadcrumb.po';
import { ElementSelector } from './ElementSelector.po';
import { selectShadowRoot } from '../lib/helpers';
import { WebDriver } from 'selenium-webdriver';
import { ThemeSelector } from './ThemeSelector.po';
import { MutantView } from './MutantView.po';

export class ReportPage extends ElementSelector {
  constructor(private readonly browser: WebDriver) {
    super(browser);
  }

  public takeScreenshot(): Promise<string> {
    return this.$('mutation-test-report-app >>> .container-fluid').takeScreenshot();
  }

  public navigateTo(path: string) {
    return this.browser.get(constants.BASE_URL + path);
  }

  public whenFileReportLoaded() {
    return this.browser.wait(async () => {
      try {
        await this.$('mutation-test-report-app >>> mutation-test-report-file');
        return true;
      } catch (err) {
        if (err instanceof Error && err.message.includes('Unable to locate element')) {
          return false;
        }
        throw err;
      }
    }, DEFAULT_TIMEOUT);
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

  get mutantView(): MutantView {
    return new MutantView(selectShadowRoot(this.$('mutation-test-report-app >>> mutation-test-report-mutant-view')), this.browser);
  }
}
