import { from } from 'rxjs';
import { mergeMap, toArray } from 'rxjs/operators';
import { WebElementPromise } from 'selenium-webdriver';
import { MAX_WEBDRIVER_CONCURRENCY } from '../lib/constants';
import { selectShadowRoot } from '../lib/helpers';
import { StateFilter } from './StateFilter.po';
import { Drawer } from './Drawer.po';
import { View } from './View.po';
import { TestComponent } from './TestComponent.po';
import { TestListItem } from './TestListItem.po';

export class TestView extends View {
  protected codeElement(): WebElementPromise {
    return this.$('mutation-test-report-test-file >>> pre');
  }

  public async tests(): Promise<TestComponent[]> {
    const test$ = from(await this.$$('mutation-test-report-test-file >>> mutation-test-report-test'));
    return test$
      .pipe(
        mergeMap(async (host) => new TestComponent(await selectShadowRoot(host), this.browser), MAX_WEBDRIVER_CONCURRENCY),
        toArray()
      )
      .toPromise();
  }

  public async testListItems(): Promise<TestListItem[]> {
    const tests = await this.$$('mutation-test-report-test-file >>> mutation-test-report-test-list-item');
    return tests.map((host) => new TestListItem(selectShadowRoot(host), this.browser));
  }

  public test(testId: number | string) {
    const shadowRoot = selectShadowRoot(this.$(`mutation-test-report-test-file >>> mutation-test-report-test[test-id="${testId}"]`));
    return new TestComponent(shadowRoot, this.browser);
  }

  public get stateFilter() {
    const context = selectShadowRoot(this.$('mutation-test-report-test-file >>> mutation-test-report-state-filter'));
    return new StateFilter(context, this.browser);
  }

  public get testDrawer() {
    const context = selectShadowRoot(this.$('mutation-test-report-drawer-test'));
    return new Drawer(context, this.browser);
  }
}
