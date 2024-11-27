import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { BaseElement } from '../base-element.js';

@customElement('mte-tooltip')
export class MutationTestReportThemeSwitchComponent extends BaseElement {
  @property({ attribute: true })
  declare title: string;

  render() {
    return html`<span class="cursor-help underline decoration-dotted" title="${this.title}"><slot></slot></span>`;
  }
}
