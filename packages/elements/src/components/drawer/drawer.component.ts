import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { renderIf } from '../../lib/html-helpers';
import { tailwind } from '../../style';
import { renderEmoji } from '../drawer-mutant/util';
import style from './drawer.component.scss';

export type DrawerMode = 'open' | 'half' | 'closed';
export const DRAWER_HALF_OPEN_SIZE = 120;

@customElement('mte-drawer')
export class MutationTestReportDrawer extends LitElement {
  public static styles = [unsafeCSS(style), tailwind];

  @property({ reflect: true })
  public mode: DrawerMode = 'closed';

  @property({ reflect: true, type: Boolean })
  public hasDetail = false;

  @property()
  public get toggleMoreLabel() {
    switch (this.mode) {
      case 'half':
        return html`${renderEmoji('🔼', 'up arrow')} More`;
      case 'open':
        return html`${renderEmoji('🔽', 'down arrow')} Less`;
      case 'closed':
        return nothing;
    }
  }

  public toggleReadMore = (event: MouseEvent) => {
    if (this.mode === 'open') {
      this.mode = 'half';
    } else {
      this.mode = 'open';
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  render() {
    return html`<aside @click="${(event: Event) => event.stopPropagation()}">
      <div class="mx-6">
        <header class="w-full py-4">
          <h2>
            <slot name="header"></slot>
            ${renderIf(
              this.hasDetail,
              html`<button data-testId="btnReadMoreToggle" class="ml-2 align-middle" @click="${this.toggleReadMore}"
                >${this.toggleMoreLabel}</button
              >`,
            )}
          </h2>
        </header>
        <div class="scrollable container fixed motion-safe:transition-max-width">
          <slot name="summary"></slot>
          ${renderIf(this.hasDetail && this.mode === 'open', html`<slot name="detail"></slot>`)}
        </div>
      </div>
    </aside>`;
  }
}
