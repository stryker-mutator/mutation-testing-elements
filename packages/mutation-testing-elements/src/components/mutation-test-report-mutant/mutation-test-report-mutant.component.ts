import { customElement, LitElement, property, html, unsafeCSS } from 'lit-element';
import { MutantResult } from 'mutation-testing-report-schema';
import { bootstrap } from '../../style';
import { getContextClassForStatus } from '../../lib/htmlHelpers';
import style from './mutation-test-report-mutant.scss';
import { createCustomEvent } from '../../lib/custom-events';

@customElement('mutation-test-report-mutant')
export class MutationTestReportMutantComponent extends LitElement {
  @property()
  public mutant: MutantResult | undefined;

  @property()
  public show = true;

  @property()
  public expand = false;

  public static styles = [bootstrap, unsafeCSS(style)];

  private readonly mutantClicked = (event: Event) => {
    this.expand = !this.expand;
    event.preventDefault();
    event.stopPropagation();
    this.dispatchEvent(createCustomEvent('mutant-selected', { selected: this.expand, mutant: this.mutant }, { bubbles: true, composed: true }));
  };

  public render() {
    // This part is newline significant, as it is rendered in a <code> block.
    // No unnecessary new lines
    return html`${this.renderButton()}${this.renderCode()}`;
  }

  private renderButton() {
    if (this.show && this.mutant) {
      return html`<span
        class="mutant-toggle badge badge-${this.expand ? 'info' : getContextClassForStatus(this.mutant.status)}"
        @click="${this.mutantClicked}"
        title="${this.mutant.mutatorName}"
        >${this.mutant.id}</span
      >`;
    }
    return undefined;
  }

  private renderCode() {
    return html`${this.renderReplacement()}${this.renderActual()}`;
  }

  private renderActual() {
    const actualCodeSlot = html`<slot></slot>`;
    return html`<span class="original-code ${this.expand && this.show ? 'disabled-code' : ''}">${actualCodeSlot}</span>`;
  }

  private renderReplacement() {
    if (this.mutant) {
      return html`<span class="replacement badge badge-info" @click="${this.mutantClicked}" ?hidden="${!this.expand || !this.show}"
        >${this.mutant.replacement || this.mutant.mutatorName}</span
      >`;
    }
    return undefined;
  }
}
