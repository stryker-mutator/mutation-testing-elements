import { constants, DEFAULT_TIMEOUT } from '../lib/constants';
import Breadcrumb from './Breadcrumb.po';
import { ElementSelector } from './ElementSelector.po';
import { selectShadowRoot, sleep } from '../lib/helpers';
import { WebDriver } from 'selenium-webdriver';
import { ThemeSelector } from './ThemeSelector.po';
import { MutantView } from './MutantView.po';
import { TestView } from './TestView.po';
import { NavTab } from './NavTab.po';

export class ReportPage extends ElementSelector {
  constructor(private readonly browser: WebDriver) {
    super(browser);
  }

  public whenFileReportLoaded() {
    return Promise.resolve();
  }

  public takeScreenshot(): Promise<string> {
    return this.$('mutation-test-report-app >>> .container-fluid').takeScreenshot();
  }

  public async navigateTo(path: string) {
    await this.browser.get(constants.BASE_URL + path);

    // Navigating to fragments (#...) resolve almost immediately. We currently don't have
    // a good way to determine that the app is fully loaded. We throw an arbitrary sleep after each navigation.
    // TODO: find a better way to determine that the page is fully loaded...
    await sleep();
  }

  public async backgroundColor() {
    const element = await this.$('mutation-test-report-app >>> .container-fluid');
    return element.getCssValue('background-color');
  }

  public title() {
    return this.browser.getTitle();
  }

  public currentUrl() {
    return this.browser.getCurrentUrl();
  }

  public breadcrumb(): Breadcrumb {
    const host = this.$('mutation-test-report-app >>> mutation-test-report-breadcrumb');
    return new Breadcrumb(selectShadowRoot(host), this.browser);
  }

  public async navigationTabs() {
    const elements = await this.$$('mutation-test-report-app >>> .nav-tabs li');
    return elements.map((li) => new NavTab(li, this.browser));
  }

  public get themeSelector(): ThemeSelector {
    return new ThemeSelector(selectShadowRoot(this.$('mutation-test-report-app >>> mutation-test-report-theme-switch')), this.browser);
  }

  get mutantView(): MutantView {
    return new MutantView(selectShadowRoot(this.$('mutation-test-report-app >>> mutation-test-report-mutant-view')), this.browser);
  }

  get testView(): TestView {
    return new TestView(selectShadowRoot(this.$('mutation-test-report-app >>> mutation-test-report-test-view')), this.browser);
  }
}
