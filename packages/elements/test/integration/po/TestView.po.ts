import { WebElementPromise } from 'selenium-webdriver';
import { selectShadowRoot } from '../lib/helpers';
import { StateFilter } from './StateFilter.po';
import { Drawer } from './Drawer.po';
import { View } from './View.po';
import { TestDot } from './TestDot.po';
import { TestListItem } from './TestListItem.po';

export class TestView extends View {
  protected codeElement(): WebElementPromise {
    return this.$('mte-test-file >>> pre');
  }

  public async testDots(): Promise<TestDot[]> {
    return (await this.$$('mte-test-file >>> svg.test-dot')).map((el) => new TestDot(el, this.browser));
  }

  public async testListItems(): Promise<TestListItem[]> {
    return (await this.$$('mte-test-file >>> button[test-id]')).map((host) => new TestListItem(host, this.browser));
  }

  public testDot(testId: number | string) {
    const el = this.$(`mte-test-file >>> svg.test-dot[test-id="${testId}"]`);
    return new TestDot(el, this.browser);
  }

  public get stateFilter() {
    const context = selectShadowRoot(this.$('mte-test-file >>> mte-state-filter'));
    return new StateFilter(context, this.browser);
  }

  public get testDrawer() {
    const context = selectShadowRoot(this.$('mte-drawer-test'));
    return new Drawer(context, this.browser);
  }
}
