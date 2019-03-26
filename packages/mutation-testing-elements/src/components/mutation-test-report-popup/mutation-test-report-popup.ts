import { customElement, LitElement, property, html, unsafeCSS } from 'lit-element';
import { bootstrap } from '../../style';

@customElement('mutation-test-report-popup')
export class MutationTestReportPopupComponent extends LitElement {

  @property()
  public header: string | undefined;

  @property()
  public content: string | undefined;

  @property({ converter: val => typeof val === 'string' })
  public show: boolean = false;

  @property()
  public context: string | undefined;

  public static styles = [
    bootstrap,
    unsafeCSS(require('./mutation-test-report-popup.scss'))
  ];

  public firstUpdated() {
    if (this.getBoundingClientRect().left < 100) {
      const popover = (this.shadowRoot as ShadowRoot).querySelector('.popover') as HTMLElement;
      popover.style.marginLeft = '0px';
    }
  }

  public getContextClasses() {
    if (this.context) {
      return `bg-${this.context} text-white`;
    } else {
      return '';
    }
  }

  public render() {
    return html`<div class="popover ${this.show ? 'show' : 'hide'}">
  <h3 class="popover-header ${this.getContextClasses()}">${this.header}</h3>
  <div class="popover-body">
    <slot name="popover-body"></slot>
  </div>
</div>${slot()}`;
    function slot() {
      return html`<slot></slot>`;
    }
  }
}
