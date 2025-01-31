import { html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { createCustomEvent } from '../../lib/custom-events.js';
import { tailwind } from '../../style/index.js';
import { BaseElement } from '../base-element.js';
import style from './theme-switch.css?inline';

@customElement('mte-theme-switch')
export class MutationTestReportThemeSwitchComponent extends BaseElement {
  @property()
  declare public theme: string | undefined;

  private readonly dispatchThemeChangedEvent = (e: MouseEvent) => {
    const checked = (e.target as HTMLInputElement).checked;
    this.dispatchEvent(createCustomEvent('theme-switch', checked ? 'dark' : 'light'));
  };

  public static override styles = [tailwind, unsafeCSS(style)];

  public render() {
    return html`
      <div class="check-box-container" @click="${(event: Event) => event.stopPropagation()}">
        <input type="checkbox" @click="${this.dispatchThemeChangedEvent}" ?checked="${this.theme === 'dark'}" id="darkTheme" />
        <label for="darkTheme">Dark</label>
      </div>
    `;
  }
}
