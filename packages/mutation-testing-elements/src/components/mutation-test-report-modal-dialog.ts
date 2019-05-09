import { customElement, LitElement, html, css, property } from 'lit-element';
import { bootstrap } from '../style';

@customElement('mutation-test-report-modal-dialog')
export class MutationTestReportModalDialogComponent extends LitElement {

  @property({ converter: val => typeof val === 'string' })
  public show = false;

  @property()
  public header!: string;

  public static styles = [
    bootstrap,
    css`
      .modal-dialog{
        margin-top: 5.15rem;
      }
    `
  ];

  public readonly emitCloseEvent = (event: Event) => {
    this.dispatchEvent(new CustomEvent('close-dialog', { bubbles: true, detail: this, composed: true }));
    event.stopPropagation();
  }

  public render() {
    return html`
    <div .hidden="${!this.show}" class="modal show" style="display: block;" tabindex="-1" role="dialog" @click="${this.emitCloseEvent}">
      <div class="modal-dialog" role="document" @click="${(e: Event) => e.stopPropagation()}">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${this.header}</h5>
          </div>
          <div class="modal-body">
            <slot name="modal-body"></slot>
          </div>
          <div class="modal-footer">
            <button type="button" @click="${this.emitCloseEvent}" class="btn btn-link">Close</button>
          </div>
        </div>
      </div>
    </div>
    <slot></slot>
    `;
  }
}
