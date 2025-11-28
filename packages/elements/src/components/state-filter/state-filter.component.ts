import type { PropertyValues, SVGTemplateResult, TemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

import { createCustomEvent } from '../../lib/custom-events.js';
import { arrowLeft, arrowRight } from '../../lib/svg-icons.js';
import { RealTimeElement } from '../real-time-element.js';

export interface StateFilter<TStatus> {
  status: TStatus;
  count: number;
  enabled: boolean;
  label: TemplateResult<1> | string;
  context: string;
}

@customElement('mte-state-filter')
export class FileStateFilterComponent<TStatus extends string> extends RealTimeElement {
  @property({ type: Array })
  declare public filters?: StateFilter<TStatus>[];

  public updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('filters')) {
      this.#dispatchFiltersChangedEvent();
    }
  }

  #checkboxChanged(filter: StateFilter<TStatus>, enabled: boolean) {
    filter.enabled = enabled;
    this.#dispatchFiltersChangedEvent();
  }

  #dispatchFiltersChangedEvent() {
    this.dispatchEvent(
      createCustomEvent(
        'filters-changed',
        this.filters!.filter(({ enabled }) => enabled).map(({ status }) => status),
      ),
    );
  }

  readonly #next = (ev: Event) => {
    ev.stopPropagation();
    this.dispatchEvent(createCustomEvent('next', undefined, { bubbles: true, composed: true }));
  };
  readonly #previous = (ev: Event) => {
    ev.stopPropagation();
    this.dispatchEvent(createCustomEvent('previous', undefined, { bubbles: true, composed: true }));
  };

  public render() {
    return html`<div class="sticky top-offset z-10 mb-1 flex flex-row gap-5 bg-white py-6 pt-7">
      <div class="flex items-center gap-2">
        ${this.#renderStepButton(this.#previous, arrowLeft, 'Previous', 'Select previous mutant')}
        ${this.#renderStepButton(this.#next, arrowRight, 'Next', 'Select next mutant')}
      </div>

      ${repeat(
        this.filters ?? [],
        // Key function. I super duper want that all properties are weighed here,
        // see https://lit-html.polymer-project.org/guide/writing-templates#repeating-templates-with-the-repeat-directive
        (filter) => filter.status,
        (filter) =>
          html`<div class="flex items-center gap-2 last:mr-12" data-status=${filter.status.toString()}>
            <input
              ?checked=${filter.enabled}
              id="filter-${filter.status}"
              aria-describedby="status-description"
              type="checkbox"
              .value=${filter.status.toString()}
              @input=${(el: Event) => this.#checkboxChanged(filter, (el.target as HTMLInputElement).checked)}
              class="h-5 w-5 shrink-0 rounded-sm bg-gray-100 ring-offset-gray-200! transition-colors checked:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
            />

            <label
              for="filter-${filter.status}"
              class="${this.#bgForContext(filter.context)} rounded-md px-2.5 py-0.5 text-sm font-medium hover:cursor-pointer"
            >
              ${filter.label} (${filter.count})
            </label>
          </div>`,
      ) as TemplateResult}
    </div>`;
  }

  #renderStepButton(handleClick: (ev: Event) => void, icon: SVGTemplateResult, title: string, srText: string) {
    return html`<button
      title=${title}
      @click=${handleClick}
      type="button"
      class="inline-flex items-center rounded-sm bg-primary-600 p-1 text-center text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
      >${icon}
      <span class="sr-only">${srText}</span>
    </button>`;
  }

  #bgForContext(context: string) {
    switch (context) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'danger':
        return 'bg-red-100 text-red-800';
      case 'caution':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
