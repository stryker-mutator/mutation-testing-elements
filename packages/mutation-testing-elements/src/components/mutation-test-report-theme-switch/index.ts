import { customElement, LitElement, html, unsafeCSS, property } from 'lit-element';
import { bootstrap } from '../../style';
import style from './index.scss';

@customElement('mutation-test-report-theme-switch')
export class MutationTestReportThemeSwitchComponent extends LitElement {
  @property()
  private dark = true;

  private readonly dispatchThemeChangedEvent = (e: MouseEvent) => {
    this.dispatchEvent(new CustomEvent('theme-switch', { detail: (e.target as HTMLInputElement).checked ? 'dark' : 'light' }));
    console.log((e.target as HTMLInputElement).checked);
  };

  public static styles = [bootstrap, unsafeCSS(style)];

  public render() {
    return html`
      <div class="check-box-container">
        <input type="checkbox" @click="${this.dispatchThemeChangedEvent}" ?checked="${this.dark}" id="time" />
        <label for="time">Night</label>
      </div>
    `;
  }
}
