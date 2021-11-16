import { WebElementPromise } from 'selenium-webdriver';
import { selectShadowRoot } from '../lib/helpers';
import { StateFilter } from './StateFilter.po';
import { MutantDot } from './MutantDot.po';
import { Drawer } from './Drawer.po';
import { View } from './View.po';

export class MutantView extends View {
  protected codeElement(): WebElementPromise {
    return this.$('mte-file >>> pre');
  }

  public async mutantDots(): Promise<MutantDot[]> {
    const dots = await this.$$('mte-file >>> svg.mutant-dot');
    return dots.map((host) => new MutantDot(host, this.browser));
  }

  public mutantDot(mutantId: number | string) {
    return new MutantDot(this.$(`mte-file >>> svg.mutant-dot[mutant-id="${mutantId}"]`), this.browser);
  }

  public stateFilter() {
    const context = selectShadowRoot(this.$('mte-file >>> mte-state-filter'));
    return new StateFilter(context, this.browser);
  }

  public mutantDrawer() {
    const context = selectShadowRoot(this.$('mte-drawer-mutant'));
    return new Drawer(context, this.browser);
  }
}
