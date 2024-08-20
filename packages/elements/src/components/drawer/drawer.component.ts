import { ResizeController } from '@lit-labs/observers/resize-controller.js';
import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Ref } from 'lit/directives/ref.js';
import { createRef, ref } from 'lit/directives/ref.js';
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

  #headerRef: Ref<HTMLElement>;

  #contentHeightController: ResizeController<number>;

  constructor() {
    super();
    this.mode = 'closed';
    this.hasDetail = false;

    this.#headerRef = createRef();
    this.#contentHeightController = new ResizeController(this, {
      callback: (entries) => {
        const total = entries[0]?.contentRect.height ?? 0;
        const header = this.#headerRef.value?.clientHeight ?? 0;
        return total - header;
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
    const contentHeight = this.#contentHeightController.value;
    const styles = styleMap({ height: contentHeight ? `${contentHeight}px` : undefined });

    return html`<aside @click="${(event: Event) => event.stopPropagation()}" class="ml-6 mr-4">
      <header class="w-full py-4" ${ref(this.#headerRef)}>
        <h2>
          <slot name="header"></slot>
          ${renderIf(
            this.hasDetail,
            html`<button data-testId="btnReadMoreToggle" class="ml-2 align-middle" @click="${this.toggleReadMore}">${this.toggleMoreLabel}</button>`,
          )}
        </h2>
      </header>
      <div style="${styles}" class="mb-4 overflow-y-auto motion-safe:transition-max-width">
        <slot name="summary"></slot>
        ${renderIf(this.hasDetail && this.mode === 'open', html`<slot name="detail"></slot>`)}
      </div>
    </aside>`;
  }
}
