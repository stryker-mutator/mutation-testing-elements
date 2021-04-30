import { WebElementPromise } from 'selenium-webdriver';
import { mapShadowRootConcurrent, selectShadowRoot } from '../lib/helpers';
import { StateFilter } from './StateFilter.po';
import { Drawer } from './Drawer.po';
import { View } from './View.po';
import { TestComponent } from './TestComponent.po';
import { TestListItem } from './TestListItem.po';

export class TestView extends View {
  protected codeElement(): WebElementPromise {
    return this.$('mte-test-file >>> pre');
  }

  public async tests(): Promise<TestComponent[]> {
    return mapShadowRootConcurrent(this.$$('mte-test-file >>> mte-test'), (el) => new TestComponent(el, this.browser));
  }

  public async testListItems(): Promise<TestListItem[]> {
    return mapShadowRootConcurrent(this.$$('mte-test-file >>> mte-test-list-item'), (host) => new TestListItem(host, this.browser));
  }

  public test(testId: number | string) {
    const shadowRoot = selectShadowRoot(this.$(`mte-test-file >>> mte-test[test-id="${testId}"]`));
    return new TestComponent(shadowRoot, this.browser);
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
