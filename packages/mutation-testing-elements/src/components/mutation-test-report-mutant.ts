import { customElement, LitElement, property, html, css } from 'lit-element';
import { MutantResult } from 'mutation-testing-report-schema';
import { bootstrap } from '../style';
import { getContextClassForStatus } from '../lib/htmlHelpers';

@customElement('mutation-test-report-mutant')
export class MutationTestReportMutantComponent extends LitElement {

  @property()
  public mutant: MutantResult | undefined;

  @property()
  public show: boolean = true;

  @property()
  public expand: boolean = false;

  public static styles = [
    bootstrap,
    css`
    .badge {
      cursor: pointer;
    }
    .disabled-code {
      text-decoration: line-through;
    }
  `];

  public render() {
    // This part is newline significant, as it is rendered in a <code> block.
    // No unnecessary new lines
    return html`${this.renderButton()}${this.renderCode()}`;
  }

  private renderButton() {
    if (this.show && this.mutant) {
      return html`<span class="mutant-toggle badge badge-${this.expand ? 'info' : getContextClassForStatus(this.mutant.status)}" @click="${() => this.expand = !this.expand}"
  title="${this.mutant.mutatorName}">${this.mutant.id}</span>`;
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
      return html`<span class="replacement badge badge-info" ?hidden="${!this.expand || !this.show}">${this.mutant.replacement}</span>`;
    }
    return undefined;
  }
}
