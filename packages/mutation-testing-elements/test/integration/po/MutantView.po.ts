import { from } from 'rxjs';
import { mergeMap, toArray } from 'rxjs/operators';
import { WebElementPromise } from 'selenium-webdriver';
import { DEFAULT_TIMEOUT, MAX_WEBDRIVER_CONCURRENCY } from '../lib/constants';
import { selectShadowRoot } from '../lib/helpers';
import { Legend } from './Legend.po';
import { MutantComponent } from './MutantComponent.po';
import { MutantDrawer } from './MutantDrawer.po';
import { PageObject } from './PageObject.po';
import { ResultTable } from './ResultTable.po';

export class MutantView extends PageObject {
  public clickOnCode() {
    return this.$('mutation-test-report-file >>> code').click();
  }

  public async whenCodeIsHighlighted(): Promise<void> {
    await this.browser.wait(() => this.isPresent('mutation-test-report-file >>> code span.token'), DEFAULT_TIMEOUT);
  }

  public async codeBackgroundColor(): Promise<string> {
    const codeElement = await this.codeElement();
    return codeElement.getCssValue('background-color');
  }

  private codeElement(): WebElementPromise {
    return this.$('mutation-test-report-file >>> pre');
  }

  public async mutants(): Promise<MutantComponent[]> {
    const mutantElement$ = from(await this.$$('mutation-test-report-file >>> mutation-test-report-mutant'));
    return mutantElement$
      .pipe(
        mergeMap(async (host) => new MutantComponent(await selectShadowRoot(host), this.browser), MAX_WEBDRIVER_CONCURRENCY),
        toArray()
      )
      .toPromise();
  }

  public mutant(mutantId: number | string) {
    const shadowRoot = selectShadowRoot(this.$(`mutation-test-report-file >>> mutation-test-report-mutant[mutant-id="${mutantId}"]`));
    return new MutantComponent(shadowRoot, this.browser);
  }

  public async scrollToCode() {
    const codeElement = await this.codeElement();
    await this.browser.executeScript(`window.scrollTo(0, ${(await codeElement.getRect()).y})`);
  }

  public legend() {
    const context = selectShadowRoot(this.$('mutation-test-report-file >>> mutation-test-report-state-filter'));
    return new Legend(context, this.browser);
  }

  public resultTable() {
    const context = selectShadowRoot(this.$('mutation-test-report-metrics-table'));
    return new ResultTable(context, this.browser);
  }

  public mutantDrawer() {
    const context = selectShadowRoot(this.$('mutation-test-report-drawer-mutant'));
    return new MutantDrawer(context, this.browser);
  }
}
