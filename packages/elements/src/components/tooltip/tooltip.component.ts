import { LitElement, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import style from './tooltip.scss';

@customElement('mte-tooltip')
export class MutationTestReportThemeSwitchComponent extends LitElement {
  @property({ attribute: true })
  title!: string;

  static styles = [unsafeCSS(style)];

  render() {
    return html`<span class="tooltip" title="${this.title}"><slot></slot></span>`;
  }
}
