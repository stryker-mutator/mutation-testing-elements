import { customElement, LitElement, property, html, unsafeCSS } from 'lit-element';
import { bootstrap } from '../../style';

// Variable should be kept in sync with 'popup-width' in './mutation-test-report-popup.scss'
const popupWidth = 200;

@customElement('mutation-test-report-popup')
export class MutationTestReportPopupComponent extends LitElement {
  @property()
  public header: string | undefined;

  @property({ converter: val => typeof val === 'string' })
  public show = false;

  @property()
  public context: string | undefined;

  public static styles = [bootstrap, unsafeCSS(require('./index.scss'))];

  public firstUpdated() {
    if (this.getBoundingClientRect().left < popupWidth / 2) {
      const popover = (this.shadowRoot as ShadowRoot).querySelector('.popover') as HTMLElement;
      popover.style.marginLeft = '0px';
    }
  }

  private getBackgroundClasses() {
    return this.context ? `bg-${this.context} text-white` : '';
  }

  public render() {
    return html`<div class="popover popover-${this.context} ${this.show ? 'show' : 'hide'}">
  <h3 class="popover-header ${this.getBackgroundClasses()}">${this.header}</h3>
  <div class="popover-body">
    <slot name="popover-body"></slot>
  </div>
</div>${slot()}`;
    function slot() {
      return html`<slot></slot>`;
    }
  }
}
