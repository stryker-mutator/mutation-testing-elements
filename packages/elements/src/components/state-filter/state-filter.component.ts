import { LitElement, PropertyValues, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import style from './state-filter.css';
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

  /**
   * Disable shadow-DOM for this component to let parent styles apply (such as dark theme)
   */
  protected override createRenderRoot(): Element | ShadowRoot {
    return this;
  }

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

  public static styles = [unsafeCSS(style)];

  public render() {
    return html`
      <div class="legend sticky flex my-1 py-4 z-10">
        <div class="flex items-center mr-3">
          <button
            title="Previous"
            @click=${this.previous}
            type="button"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg p-1 text-center inline-flex items-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            <svg aria-hidden="true" class="w-4 h-4 rotate-180" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <span class="sr-only">Select previous mutant</span>
          </button>
          <button
            title="Next"
            @click=${this.next}
            type="button"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg p-1 text-center inline-flex items-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            <svg aria-hidden="true" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <span class="sr-only">Select next mutant</span>
          </button>
        </div>

        ${this.filters &&
        repeat(
          this.filters,
          // Key function. I super duper want that all properties are weighed here,
          // see https://lit-html.polymer-project.org/guide/writing-templates#repeating-templates-with-the-repeat-directive
          (filter) => JSON.stringify(filter),
          (filter) => html`
            <div class="flex items-center mr-4" data-status="${filter.status}">
              <input
                ?checked="${filter.enabled}"
                id="filter-${filter.status}"
                type="checkbox"
                value="${filter.status}"
                class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 hover:cursor-pointer"
                @input="${(el: Event) => this.checkboxChanged(filter, (el.target as HTMLInputElement).checked)}"
              />

              <label
                for="filter-${filter.status}"
                class="text-sm font-medium mx-2 px-2.5 py-0.5 rounded hover:cursor-pointer ${this.bgForContext(filter.context)}"
              >
                ${filter.label} (${filter.count})
              </label>
            </div>
          `
        )}
      </div>
    `;
  }

  private bgForContext(context: string) {
    switch (context) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-gray-100';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-200 dark:text-yellow-800';
      case 'danger':
        return 'bg-red-100 text-red-800 dark:bg-red-200 dark:text-red-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-200 dark:text-gray-800';
    }
  }
}
