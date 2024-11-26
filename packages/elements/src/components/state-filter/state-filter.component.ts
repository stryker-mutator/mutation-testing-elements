import type { PropertyValues, SVGTemplateResult, TemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

import { createCustomEvent } from '../../lib/custom-events.js';
import { renderIf } from '../../lib/html-helpers.js';
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
  public declare filters?: StateFilter<TStatus>[];

  public updated(changedProperties: PropertyValues<this>) {
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
        this.filters!.filter(({ enabled }) => enabled).map(({ status }) => status),
      ),
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

  public render() {
    return html`
      <div class="sticky top-offset z-10 flex flex-row bg-white py-6">
        <div class="mr-3">
          ${this.#renderStepButton(this.previous, arrowLeft, 'Previous', 'Select previous mutant')}
          ${this.#renderStepButton(this.next, arrowRight, 'Next', 'Select next mutant')}
        </div>

        ${renderIf(
          this.filters?.length,
          repeat(
            this.filters!,
            // Key function. I super duper want that all properties are weighed here,
            // see https://lit-html.polymer-project.org/guide/writing-templates#repeating-templates-with-the-repeat-directive
            (filter) => filter.status,
            (filter) => html`
              <div class="mr-4 flex items-center" data-status="${filter.status}">
                <input
                  ?checked="${filter.enabled}"
                  id="filter-${filter.status}"
                  aria-describedby="status-description"
                  type="checkbox"
                  .value="${filter.status}"
                  @input="${(el: Event) => this.checkboxChanged(filter, (el.target as HTMLInputElement).checked)}"
                  class="h-5 w-5 rounded border-gray-300 bg-gray-100 text-primary-on !ring-offset-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />

                <label
                  for="filter-${filter.status}"
                  class="${this.bgForContext(filter.context)} mx-2 rounded px-2.5 py-0.5 text-sm font-medium hover:cursor-pointer"
                >
                  ${filter.label} (${filter.count})
                </label>
              </div>
            `,
          ) as TemplateResult,
        )}
      </div>
    `;
  }

  #renderStepButton(handleClick: (ev: Event) => void, icon: SVGTemplateResult, title: string, srText: string) {
    return html`<button
      title="${title}"
      @click=${handleClick}
      type="button"
      class="mr-2 inline-flex items-center rounded-md bg-primary-600 p-1 text-center text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >${icon}
      <span class="sr-only">${srText}</span>
    </button>`;
  }

  private bgForContext(context: string) {
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
