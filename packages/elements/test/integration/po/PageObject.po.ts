import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { ElementSelector } from './ElementSelector.po.js';

export class PageObject extends ElementSelector {
  protected readonly host: Locator;
  protected readonly browser: Page;
  constructor(host: Locator, browser: Page) {
    super(host);
    this.host = host;
    this.browser = browser;
  }

  public waitForVisible() {
    return expect(this.host).toBeVisible();
  }

  public waitForHidden() {
    return expect(this.host).toBeHidden();
  }
}
