import { expect } from '@playwright/test';

import { PageObject } from './PageObject.po.js';

export const HALF_OPEN_SIZE = 120;
const CLOSED_SIZE = 0;

export class Drawer extends PageObject {
  public get header() {
    return this.$('[slot="header"]');
  }

  get #readMoreToggle() {
    return this.$('mte-drawer >> [data-testId="btnReadMoreToggle"]');
  }

  public toggleReadMore() {
    return this.#readMoreToggle.click();
  }

  public details() {
    return this.$('mte-drawer >> [slot="detail"]');
  }

  public async clickOnHeader() {
    return this.header.click();
  }

  public async height() {
    return (await this.$('mte-drawer').boundingBox())?.height ?? 0;
  }

  public summary() {
    return this.$('[slot="summary"]');
  }

  public async whenOpen() {
    await expect.poll(() => this.height()).toBeGreaterThan(HALF_OPEN_SIZE);
  }

  public whenHalfOpen() {
    return expect.poll(() => this.height()).toBe(HALF_OPEN_SIZE);
  }

  public whenClosed() {
    return expect.poll(() => this.height()).toBe(CLOSED_SIZE);
  }
}
