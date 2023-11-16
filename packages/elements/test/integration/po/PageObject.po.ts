import { expect } from '@playwright/test';
import { ElementSelector } from './ElementSelector.po.js';
import type { Locator, Page } from '@playwright/test';

export class PageObject extends ElementSelector {
  constructor(
    protected readonly host: Locator,
    protected readonly browser: Page,
  ) {
    super(host);
  }

  public waitForVisible() {
    return expect(this.host).toBeVisible();
  }

  public waitForHidden() {
    return expect(this.host).toBeHidden();
  }
}
