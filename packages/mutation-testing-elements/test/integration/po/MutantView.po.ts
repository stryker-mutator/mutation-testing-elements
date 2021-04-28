import { WebElementPromise } from 'selenium-webdriver';
import { mapShadowRootConcurrent, selectShadowRoot } from '../lib/helpers';
import { StateFilter } from './StateFilter.po';
import { MutantComponent } from './MutantComponent.po';
import { Drawer } from './Drawer.po';
import { View } from './View.po';

export class MutantView extends View {
  protected codeElement(): WebElementPromise {
    return this.$('mutation-test-report-file >>> pre');
  }

  public mutants(): Promise<MutantComponent[]> {
    return mapShadowRootConcurrent(
      this.$$('mutation-test-report-file >>> mutation-test-report-mutant'),
      (host) => new MutantComponent(host, this.browser)
    );
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
