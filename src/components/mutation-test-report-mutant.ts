import { customElement, LitElement, property, html, css } from 'lit-element';
import { MutantResult, MutantStatus } from '../api';
import { getContextClassForStatus } from '../helpers';
import { bootstrap } from '../style';

@customElement('mutation-test-report-mutant')
export class MutationTestReportMutantComponent extends LitElement {

  @property()
  public mutantId!: string;

  @property()
  public mutatorName!: string;

  @property()
  public replacement!: string;

  @property()
  public status!: MutantStatus;

  @property()
  public show: boolean = true;

  @property()
  public open: boolean = false;

  public static styles = [css`
    .badge {
      cursor: pointer;
    }
    .disabled-code {
      text-decoration: line-through;
    }
  `, bootstrap];

  public connectedCallback() {
    super.connectedCallback();
    console.log(this.mutatorName, this.replacement, this.status);
  }

  public render() {
    // This part is newline significant, as it is rendered in a <code> block.
    // No unnecessary new lines
    return html`${this.renderButton()}${this.renderCode()}`;
  }

  private renderButton() {
    if (this.show) {
      return html`<span class="badge badge-${this.open ? 'info' : getContextClassForStatus(this.status)}" @click="${() => this.open = !this.open}" title="${this.mutatorName}">${this.mutantId}</button>`;
    } else {
      return undefined;
    }
  }

  private renderCode() {
    return html`<span class="badge badge-info" ?hidden="${!this.open || !this.show}">${this.replacement}</span><slot class="${this.open && this.show ? 'disabled-code' : ''}"></slot>`;
  }
}
