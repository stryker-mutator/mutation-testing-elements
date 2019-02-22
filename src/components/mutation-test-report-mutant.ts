import { customElement, LitElement, property, html, css } from 'lit-element';
import { MutantResult } from '../../api';
import { getContextClassForStatus } from '../helpers';
import { bootstrap } from '../style';

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
    ::slotted(.hljs-string) {
      color: #fff;
    }
  `];

  public render() {
    // This part is newline significant, as it is rendered in a <code> block.
    // No unnecessary new lines
    return html`${this.renderButton()}${this.renderCode()}`;
  }

  private renderButton() {
    if (this.show && this.mutant) {
      return html`<span class="badge badge-${this.expand ? 'info' : getContextClassForStatus(this.mutant.status)}" @click="${() => this.expand = !this.expand}"
  title="${this.mutant.mutatorName}">${this.mutant.id}</button>`;
    } else {
      return undefined;
    }
  }

  private renderCode() {
    return html`${this.renderReplacement()}${this.renderActual()}`;
  }

  private renderActual() {
    const actualCodeSlot = html`<slot></slot>`;
    return html`<span class="${this.expand && this.show ? 'disabled-code' : ''}">${actualCodeSlot}</span>`;
  }

  private renderReplacement() {
    if (this.mutant) {
      return html`<span class="badge badge-info" ?hidden="${!this.expand || !this.show}">${this.mutant.replacement}</span>`;
    } else {
      return undefined;
    }
  }
}
