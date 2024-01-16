import { StateFilter } from './StateFilter.po.js';
import { MutantDot } from './MutantDot.po.js';
import { Drawer } from './Drawer.po.js';
import { View } from './View.po.js';
import { MutantMarker } from './MutantMarker.po.js';
import type { Locator } from '@playwright/test';

export class MutantView extends View {
  protected codeElement(): Locator {
    return this.$('mte-file >> pre');
  }

  public async mutantDots(): Promise<MutantDot[]> {
    const dots = await this.$$('mte-file >> svg.mutant-dot');
    return dots.map((host) => new MutantDot(host, this.browser));
  }

  public mutantDot(mutantId: number | string) {
    return new MutantDot(this.$(`mte-file >> svg.mutant-dot[mutant-id="${mutantId}"]`).first(), this.browser);
  }

  public mutantMarker(mutantId: number | string) {
    return new MutantMarker(this.$(`mte-file >> span.mutant[mutant-id="${mutantId}"]`).first(), this.browser);
  }
  public async mutantMarkers() {
    const spans = await this.$$(`mte-file >> span.mutant[mutant-id]`);
    return spans.map((span) => new MutantMarker(span, this.browser));
  }

  public stateFilter() {
    const context = this.$('mte-file >> mte-state-filter');
    return new StateFilter(context, this.browser);
  }

  public mutantDrawer() {
    const context = this.$('mte-drawer-mutant');
    return new Drawer(context, this.browser);
  }
  public async currentDiff(): Promise<null | Diff> {
    const [mutatedLineElements, originalLineElements] = (
      await Promise.all([this.$('mte-file >> .diff-new .code').allInnerTexts(), this.$('mte-file >> .diff-old .code').allInnerTexts()])
    ).map((items) => items.map((item) => item.trim()));

    if (mutatedLineElements.length || originalLineElements.length) {
      return {
        mutated: mutatedLineElements.join('\n').trim(),
        original: originalLineElements.join('\n').trim(),
      };
    }
    return null;
  }
}

interface Diff {
  mutated: string;
  original: string;
}
