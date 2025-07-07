import type { Page } from '@playwright/test';

import Breadcrumb from './Breadcrumb.po.js';
import { ElementSelector } from './ElementSelector.po.js';
import { MutantView } from './MutantView.po.js';
import { NavTab } from './NavTab.po.js';
import { RealTimeProgressBar } from './RealTimeProgressBar.po.js';
import { TestView } from './TestView.po.js';
import { ThemeSelector } from './ThemeSelector.po.js';

export class ReportPage extends ElementSelector {
  constructor(private readonly page: Page) {
    super(page.locator('body'));
  }

  public whenFileReportLoaded() {
    return this.$('mutation-test-report-app >> :is(mte-test-view, mte-mutant-view)').waitFor();
  }

  public scrollUp(): Promise<void> {
    return this.page.evaluate('window.scroll(0, 0)');
  }

  public scrollDown(): Promise<void> {
    return this.page.evaluate('window.scrollTo(0, document.body.scrollHeight);');
  }

  public async navigateTo(path: string) {
    await this.page.goto(path);
    await this.whenFileReportLoaded();
  }

  public async backgroundColor(): Promise<string> {
    return this.$('mutation-test-report-app >> div')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
  }

  public currentUrl() {
    return this.page.url();
  }

  public breadcrumb(): Breadcrumb {
    const host = this.$('mutation-test-report-app >> mte-breadcrumb');
    return new Breadcrumb(host, this.page);
  }

  public async navigationTabs() {
    const elements = await this.$$('mutation-test-report-app >> [role=tablist] li');
    return elements.map((li) => new NavTab(li, this.page));
  }

  public get themeSelector(): ThemeSelector {
    return new ThemeSelector(this.$('mutation-test-report-app >> mte-theme-switch'), this.page);
  }

  get mutantView(): MutantView {
    return new MutantView(this.$('mutation-test-report-app >> mte-mutant-view'), this.page);
  }

  get testView(): TestView {
    return new TestView(this.$('mutation-test-report-app >> mte-test-view'), this.page);
  }

  get realTimeProgressBar(): RealTimeProgressBar {
    return new RealTimeProgressBar(this.$('mutation-test-report-app >> mte-result-status-bar'), this.page);
  }

  pageYOffset(): Promise<number> {
    return this.page.evaluate('window.pageYOffset');
  }
}
