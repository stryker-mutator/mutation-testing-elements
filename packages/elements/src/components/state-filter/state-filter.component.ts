import { PropertyValues, html, unsafeCSS, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { createCustomEvent } from '../../lib/custom-events';
import { renderIf } from '../../lib/html-helpers';
import { tailwind } from '../../style';
import style from './state-filter.scss';
import { RealTimeElement } from '../real-time-element';

export interface StateFilter<TStatus> {
  status: TStatus;
  count: number;
  enabled: boolean;
  label: TemplateResult<1> | string;
  context: string;
}

@customElement('mte-state-filter')
export class FileStateFilterComponent<TStatus extends string> extends RealTimeElement {
  static styles = [tailwind, unsafeCSS(style)];

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

  public render() {
    return html`
      <div class="sticky top-offset z-10 my-1 flex flex-row bg-white py-4">
        <div class="mr-3">
          <button title="Previous" @click=${this.previous} type="button" class="step-button">
            <svg aria-hidden="true" class="h-4 w-4 rotate-180" fill="white" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <span class="sr-only">Select previous mutant</span>
          </button>
          <button title="Next" @click=${this.next} type="button" class="step-button">
            <svg aria-hidden="true" class="h-4 w-4" fill="white" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <span class="sr-only">Select next mutant</span>
          </button>
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
                  value="${filter.status}"
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
            `
          ) as TemplateResult
        )}
      </div>
    `;
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
