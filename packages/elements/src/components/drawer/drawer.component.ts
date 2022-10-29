import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { renderIf } from '../../lib/html-helpers';
import style from './drawer.component.scss';

export type DrawerMode = 'open' | 'half' | 'closed';
export const DRAWER_HALF_OPEN_SIZE = 120;

@customElement('mte-drawer')
export class MutationTestReportDrawer extends LitElement {
  public static styles = [unsafeCSS(style)];

  @property({ reflect: true })
  public mode: DrawerMode = 'closed';

  @property({ reflect: true, type: Boolean })
  public hasDetail = false;

  @property()
  public get toggleMoreLabel() {
    switch (this.mode) {
      case 'half':
        return '🔼 More';
      case 'open':
        return '🔽 Less';
      case 'closed':
        return '';
    }
  }

  // /**
  //  * Disable shadow-DOM for this component to let parent styles apply (such as dark theme)
  //  */
  // protected override createRenderRoot(): Element | ShadowRoot {
  //   return this;
  // }

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
    return html`<aside class="scrollable" @click="${(event: Event) => event.stopPropagation()}">
      <div class="drawer-list">
        <header>
          <h5>
            <slot name="header"></slot>
            ${renderIf(
              this.hasDetail,
              html`<button data-testId="btnReadMoreToggle" class="btn" @click="${this.toggleReadMore}">${this.toggleMoreLabel}</button>`
            )}
          </h5>
        </header>
        <div>
          <slot name="summary"></slot>
          ${renderIf(this.hasDetail && this.mode === 'open', html`<slot name="detail"></slot>`)}
        </div>
      </div>
    </aside>`;
  }
}
