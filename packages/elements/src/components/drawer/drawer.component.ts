import { html, nothing, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { when } from 'lit/directives/when.js';

import { tailwind } from '../../style/index.js';
import { BaseElement } from '../base-element.js';
import { renderEmoji } from '../drawer-mutant/util.js';
import style from './drawer.component.css?inline';

export type DrawerMode = 'open' | 'half' | 'closed';
export const DRAWER_HALF_OPEN_SIZE = 120;

@customElement('mte-drawer')
export class MutationTestReportDrawer extends BaseElement {
  public static override styles = [unsafeCSS(style), tailwind];

  @property({ reflect: true })
  declare public mode: DrawerMode;

  @property({ reflect: true, type: Boolean, attribute: 'has-detail' })
  declare public hasDetail;

  @property({ attribute: false })
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

  #abortController: AbortController;

  constructor() {
    super();
    this.mode = 'closed';
    this.hasDetail = false;
    this.#abortController = new AbortController();
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

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('keydown', this.#handleKeyDown, { signal: this.#abortController.signal });
  }

  disconnectedCallback(): void {
    this.#abortController.abort();
    super.disconnectedCallback();
  }

  #handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.mode = 'closed';
    }
  };

  render() {
    const isOpen = this.mode === 'open';

    return html`<aside @click=${(event: Event) => event.stopPropagation()} class="mr-4 ml-6 flex h-full flex-col">
      <header class="w-full shrink-0 py-4">
        <h2>
          <slot name="header"></slot>
          ${when(
            this.hasDetail,
            () =>
              html`<button data-testId="btnReadMoreToggle" class="ml-2 cursor-pointer align-middle" @click=${this.toggleReadMore}>
                ${this.toggleMoreLabel}
              </button>`,
          )}
        </h2>
      </header>
      <div class=${classMap({ ['min-h-0 flex-1 motion-safe:transition-max-width']: true, 'overflow-y-auto': isOpen })}>
        <slot name="summary"></slot>
        ${when(this.hasDetail && this.mode === 'open', () => html`<slot name="detail"></slot>`)}
      </div>
    </aside>`;
  }
}
