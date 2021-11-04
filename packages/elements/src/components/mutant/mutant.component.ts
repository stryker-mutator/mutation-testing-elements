import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { bootstrap } from '../../style';
import { getContextClassForStatus } from '../../lib/html-helpers';
import style from './mutant.scss';
import { createCustomEvent } from '../../lib/custom-events';
import { MutantModel } from 'mutation-testing-metrics';

@customElement('mte-mutant')
export class MutationTestReportMutantComponent extends LitElement {
  @property()
  public mutant: MutantModel | undefined;

  @property()
  public show = true;

  @property()
  public expand = false;

  public static styles = [bootstrap, unsafeCSS(style)];

  private readonly mutantClicked = (event: Event) => {
    this.expand = !this.expand;
    event.stopPropagation();
    this.dispatchEvent(createCustomEvent('mutant-selected', { selected: this.expand, mutant: this.mutant }, { bubbles: true, composed: true }));
  };

  public render() {
    // This part is newline significant, as it is rendered in a <code> block.
    // No unnecessary new lines
    return html`${this.renderButton()}`;
  }

  private renderButton() {
    if (this.show && this.mutant) {
      return html`<span
        class="mutant-toggle badge bg-${this.expand ? 'info' : getContextClassForStatus(this.mutant.status)}"
        @click="${this.mutantClicked}"
        title="${this.mutant.mutatorName}"
        >${this.mutant.id}</span
      >`;
    }
    return undefined;
  }
}
