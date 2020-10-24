import { customElement, LitElement, html, unsafeCSS, property } from 'lit-element';
import { bootstrap } from '../../style';
import style from './index.scss';

@customElement('mutation-test-report-theme-switch')
export class MutationTestReportThemeSwitchComponent extends LitElement {
  @property()
  public theme: string | undefined;

  private readonly dispatchThemeChangedEvent = (e: MouseEvent) => {
    const checked = (e.target as HTMLInputElement).checked;
    this.dispatchEvent(new CustomEvent('theme-switch', { detail: checked ? 'dark' : 'light' }));
  };

  public static styles = [bootstrap, unsafeCSS(style)];

  public render() {
    return html`
      <div class="check-box-container">
        <input type="checkbox" @click="${this.dispatchThemeChangedEvent}" ?checked="${this.theme == 'dark'}" id="darkTheme" />
        <label for="darkTheme">Dark</label>
      </div>
    `;
  }
}
