import { ResizeController } from '@lit-labs/observers/resize-controller.js';
import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { renderIf } from '../../lib/html-helpers.js';
import { tailwind } from '../../style/index.js';
import { renderEmoji } from '../drawer-mutant/util.js';
import style from './drawer.component.css?inline';

export type DrawerMode = 'open' | 'half' | 'closed';
export const DRAWER_HALF_OPEN_SIZE = 120;

@customElement('mte-drawer')
export class MutationTestReportDrawer extends LitElement {
  public static styles = [unsafeCSS(style), tailwind];

  @property({ reflect: true })
  public declare mode: DrawerMode;

  @property({ reflect: true, type: Boolean })
  public declare hasDetail;

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

  #drawerResizeObserver: ResizeController<Pick<DOMRectReadOnly, 'width' | 'height'>>;

  constructor() {
    super();
    this.mode = 'closed';
    this.hasDetail = false;
    this.#drawerResizeObserver = new ResizeController(this, {
      callback: (entries) => {
        const contentRect = entries[0]?.contentRect;
        return { width: contentRect?.width ?? 0, height: contentRect?.height ?? 0 };
      },
    });
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
    const height = this.#drawerResizeObserver.value?.height;
    const classes = styleMap({ [`height`]: height ? `${height}px` : undefined });

    return html`<aside @click="${(event: Event) => event.stopPropagation()}" style="${classes}" class="ml-6 mr-3 mt-4 overflow-y-auto">
      <header class="w-full pb-4">
        <h2>
          <slot name="header"></slot>
          ${renderIf(
            this.hasDetail,
            html`<button data-testId="btnReadMoreToggle" class="ml-2 align-middle" @click="${this.toggleReadMore}">${this.toggleMoreLabel}</button>`,
          )}
        </h2>
      </header>
      <div class="motion-safe:transition-max-width">
        <slot name="summary"></slot>
        ${renderIf(this.hasDetail && this.mode === 'open', html`<slot name="detail"></slot>`)}
      </div>
    </aside>`;
  }
}
