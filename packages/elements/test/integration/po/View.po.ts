import { PageObject } from './PageObject.po.js';
import { ResultTable } from './ResultTable.po.js';
import type { Locator } from '@playwright/test';

export abstract class View extends PageObject {
  public clickOnCode() {
    return this.codeElement().click();
  }

  public async whenCodeIsHighlighted(): Promise<void> {
    return this.codeElement().locator('span.token').first().waitFor();
  }

  public async codeBackgroundColor(): Promise<string> {
    return this.codeElement().evaluate((el) => getComputedStyle(el).backgroundColor);
  }

  protected abstract codeElement(): Locator;

  public async scrollToCode() {
    const codeElement = this.codeElement();
    await this.browser.evaluate(`window.scrollTo(0, ${(await codeElement.boundingBox())!.y})`);
  }

  public resultTable() {
    return new ResultTable(this.$('mte-metrics-table'), this.browser);
  }
}
