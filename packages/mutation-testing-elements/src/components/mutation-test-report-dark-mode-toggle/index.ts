import { customElement, LitElement, html, unsafeCSS, property } from 'lit-element';
import { bootstrap } from '../../style';
import style from './index.scss';

@customElement('mutation-test-report-dark-mode-toggle')
export class MutationTestReportDarkModeToggleComponent extends LitElement {
  @property()
  private dark = true;

  private readonly dispatchDarkModeChangedEvent = (e: MouseEvent) => {
    this.dispatchEvent(new CustomEvent('toggle', { detail: (e.target as HTMLInputElement).checked }));
    console.log((e.target as HTMLInputElement).checked);
  };

  public static styles = [bootstrap, unsafeCSS(style)];

  public render() {
    return html`
      <div class="check-box-container">
        <input type="checkbox" @click="${this.dispatchDarkModeChangedEvent}" ?checked="${this.dark}" id="time" />
        <label for="time">Night</label>
      </div>
    `;
  }
}
