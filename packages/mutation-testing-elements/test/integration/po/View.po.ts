import { By, WebElementPromise } from 'selenium-webdriver';
import { DEFAULT_TIMEOUT } from '../lib/constants';
import { selectShadowRoot } from '../lib/helpers';
import { PageObject } from './PageObject.po';
import { ResultTable } from './ResultTable.po';

export abstract class View extends PageObject {
  public clickOnCode() {
    return this.codeElement().click();
  }

  public async whenCodeIsHighlighted(): Promise<void> {
    await this.browser.wait(async () => {
      const code = await this.codeElement();
      await code.findElement(By.css('span.token'));
      return true;
    }, DEFAULT_TIMEOUT);
  }

  public async codeBackgroundColor(): Promise<string> {
    const codeElement = await this.codeElement();
    return codeElement.getCssValue('background-color');
  }

  protected abstract codeElement(): WebElementPromise;

  public async scrollToCode() {
    const codeElement = await this.codeElement();
    await this.browser.executeScript(`window.scrollTo(0, ${(await codeElement.getRect()).y})`);
  }

  public resultTable() {
    const context = selectShadowRoot(this.$('mutation-test-report-metrics-table'));
    return new ResultTable(context, this.browser);
  }
}
