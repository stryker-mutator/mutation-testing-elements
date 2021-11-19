import { LitElement, PropertyValues, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { bootstrap } from '../../style';
import style from './state-filter.scss';
import { createCustomEvent } from '../../lib/custom-events';

export interface StateFilter<TStatus> {
  status: TStatus;
  count: number;
  enabled: boolean;
  label: string;
  context: string;
}

@customElement('mte-state-filter')
export class FileStateFilterComponent<TStatus extends string> extends LitElement {
  @property({ type: Array })
  public filters?: StateFilter<TStatus>[];

  public updated(changedProperties: PropertyValues) {
    if (changedProperties.has('filters')) {
      this.dispatchFiltersChangedEvent();
    }
  }

  private checkboxChanged(filter: StateFilter<TStatus>, enabled: boolean) {
    filter.enabled = enabled;
    this.dispatchFiltersChangedEvent();
  }

  private dispatchFiltersChangedEvent() {
    this.dispatchEvent(
      createCustomEvent(
        'filters-changed',
        this.filters!.filter(({ enabled }) => enabled).map(({ status }) => status)
      )
    );
  }

  private readonly next = (ev: Event) => {
    ev.stopPropagation();
    this.dispatchEvent(createCustomEvent('next', undefined, { bubbles: true, composed: true }));
  };
  private readonly previous = (ev: Event) => {
    ev.stopPropagation();
    this.dispatchEvent(createCustomEvent('previous', undefined, { bubbles: true, composed: true }));
  };

  public static styles = [bootstrap, unsafeCSS(style)];

  public render() {
    return html`
      <div class="legend col-md-12 d-flex align-items-center">
        <div class="d-flex me-2">
          <button title="Previous" @click=${this.previous} class="me-1 btn btn-sm btn-secondary mte-previous" type="button">&lt;</button>
          <button title="Next" @click=${this.next} class="btn btn-sm btn-secondary mte-next" type="button">&gt;</button>
        </div>

        ${this.filters &&
        repeat(
          this.filters,
          // Key function. I super duper want that all properties are weighed here,
          // see https://lit-html.polymer-project.org/guide/writing-templates#repeating-templates-with-the-repeat-directive
          (filter) => JSON.stringify(filter),
          (filter) => html`<div data-status="${filter.status}" class="form-check form-check-inline">
            <label class="form-check-label">
              <input
                class="form-check-input"
                type="checkbox"
                ?checked="${filter.enabled}"
                value="${filter.status}"
                @input="${(el: Event) => this.checkboxChanged(filter, (el.target as HTMLInputElement).checked)}"
              />
              <span class="badge bg-${filter.context}">${filter.label} (${filter.count})</span>
            </label>
          </div>`
        )}
      </div>
    `;
  }
}
