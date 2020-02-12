import { customElement, LitElement, property, html, unsafeCSS } from 'lit-element';
import { MutantResult } from 'mutation-testing-report-schema';
import { bootstrap } from '../../style';
import { getContextClassForStatus, getEmojiForStatus } from '../../lib/htmlHelpers';

@customElement('mutation-test-report-mutant')
export class MutationTestReportMutantComponent extends LitElement {
  @property()
  public mutant: MutantResult | undefined;

  @property()
  public show = true;

  @property()
  public expand = false;

  @property()
  public showPopup = false;

  public static styles = [bootstrap, unsafeCSS(require('./index.scss'))];

  private readonly mutantClicked = (event: Event) => {
    this.expand = !this.expand;
    this.showPopup = this.expand;
    event.stopImmediatePropagation();
    this.dispatchEvent(new CustomEvent('mutant-selected', { bubbles: true, detail: this, composed: true }));
  };

  public render() {
    // This part is newline significant, as it is rendered in a <code> block.
    // No unnecessary new lines
    return html`${this.renderButton()}${this.renderCode()}`;
  }

  private renderButton() {
    if (this.show && this.mutant) {
      return html`<mutation-test-report-popup ?show="${this.showPopup}" context="${getContextClassForStatus(this.mutant.status)}" header="${this.mutant.mutatorName}">${this.renderPopupBody(this.mutant)}<span class="mutant-toggle badge badge-${this.expand ? 'info' : getContextClassForStatus(this.mutant.status)}"
    @click="${this.mutantClicked}" title="${this.mutant.mutatorName}">${this.mutant.id}</span></mutation-test-report-popup>`;
    }
    return undefined;
  }

  private renderPopupBody(mutant: MutantResult) {
    return html`<div slot="popover-body"><span class="btn">${getEmojiForStatus(mutant.status)} ${mutant.status}</span>${this.renderDescription(mutant)}</div>`;
  }

  private renderDescription(mutant: MutantResult) {
    if (mutant.description) {
      return html`
        <button class="show-more btn btn-link" @click="${() => this.showMoreInfo(mutant)}">📖 Show more</button>
      `;
    }
    return undefined;
  }

  private readonly showMoreInfo = (mutant: MutantResult) => {
    this.dispatchEvent(new CustomEvent(SHOW_MORE_EVENT, { bubbles: true, detail: mutant, composed: true }));
  };

  private renderCode() {
    return html`${this.renderReplacement()}${this.renderActual()}`;
  }

  private renderActual() {
    const actualCodeSlot = html`<slot></slot>`;
    return html`<span class="original-code ${this.expand && this.show ? 'disabled-code' : ''}">${actualCodeSlot}</span>`;
  }
  
  private renderReplacement() {
    if (this.mutant) {
      return html`<span class="replacement badge badge-info" @click="${this.mutantClicked}" ?hidden="${!this.expand || !this.show}">${this.mutant.replacement || this.mutant.mutatorName}</span>`;
    }
    return undefined;
  }
}

export const SHOW_MORE_EVENT = 'show-more-click';
