import { WebElementPromise } from 'selenium-webdriver';
import { selectShadowRoot } from '../lib/helpers';
import { StateFilter } from './StateFilter.po';
import { MutantDot } from './MutantDot.po';
import { Drawer } from './Drawer.po';
import { View } from './View.po';
import { MutantMarker } from './MutantMarker.po';

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

  public mutantMarker(mutantId: number | string) {
    return new MutantMarker(this.$(`mte-file >>> span.mutant[mutant-id="${mutantId}"]`), this.browser);
  }
  public async mutantMarkers() {
    const spans = await this.$$(`mte-file >>> span.mutant[mutant-id]`);
    return spans.map((span) => new MutantMarker(span, this.browser));
  }

  public stateFilter() {
    const context = selectShadowRoot(this.$('mte-file >>> mte-state-filter'));
    return new StateFilter(context, this.browser);
  }

  public mutantDrawer() {
    const context = selectShadowRoot(this.$('mte-drawer-mutant'));
    return new Drawer(context, this.browser);
  }
  public async currentDiff(): Promise<null | Diff> {
    const mutatedLineElements = await this.$$('mte-file >>> .diff-new .code');
    const originalLineElements = await this.$$('mte-file >>> .diff-old .code');
    if (mutatedLineElements.length || originalLineElements.length) {
      return {
        mutated: (await Promise.all(mutatedLineElements.map((mutatedEl) => mutatedEl.getText()))).join('\n').trim(),
        // Don't use "getText()" for original, as that also returns the text content of the "<title>" svg elements
        original: (
          await Promise.all(originalLineElements.map((originalEl) => this.browser.executeScript<string>('return arguments[0].innerText', originalEl)))
        )
          .join('\n')
          .trim(),
      };
    }
    return null;
  }
}

interface Diff {
  mutated: string;
  original: string;
}
