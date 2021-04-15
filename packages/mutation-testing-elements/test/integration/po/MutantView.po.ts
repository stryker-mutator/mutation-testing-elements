import { from } from 'rxjs';
import { mergeMap, toArray } from 'rxjs/operators';
import { WebElementPromise } from 'selenium-webdriver';
import { MAX_WEBDRIVER_CONCURRENCY } from '../lib/constants';
import { selectShadowRoot } from '../lib/helpers';
import { StateFilter } from './StateFilter.po';
import { MutantComponent } from './MutantComponent.po';
import { Drawer } from './Drawer.po';
import { View } from './View.po';

export class MutantView extends View {
  protected codeElement(): WebElementPromise {
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

  public stateFilter() {
    const context = selectShadowRoot(this.$('mutation-test-report-file >>> mutation-test-report-state-filter'));
    return new StateFilter(context, this.browser);
  }

  public mutantDrawer() {
    const context = selectShadowRoot(this.$('mutation-test-report-drawer-mutant'));
    return new Drawer(context, this.browser);
  }
}
