import type { Locator } from '@playwright/test';

import { Drawer } from './Drawer.po.js';
import { StateFilter } from './StateFilter.po.js';
import { TestDot } from './TestDot.po.js';
import { TestListItem } from './TestListItem.po.js';
import { View } from './View.po.js';

export class TestView extends View {
  protected codeElement(): Locator {
    return this.$('mte-test-file >> pre');
  }

  public async testDots(): Promise<TestDot[]> {
    return (await this.$$('mte-test-file >> svg.test-dot')).map((el) => new TestDot(el, this.browser));
  }

  public async testListItems(): Promise<TestListItem[]> {
    return (await this.$$('mte-test-file >> button[data-test-id]')).map((host) => new TestListItem(host, this.browser));
  }

  public testDot(testId: number | string) {
    const el = this.$(`mte-test-file >> svg.test-dot[data-test-id="${testId}"]`);
    return new TestDot(el, this.browser);
  }

  public get stateFilter() {
    const context = this.$('mte-test-file >> mte-state-filter');
    return new StateFilter(context, this.browser);
  }

  public get testDrawer() {
    const context = this.$('mte-drawer-test');
    return new Drawer(context, this.browser);
  }
}
