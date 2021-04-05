import { customElement, LitElement, property, PropertyValues, html, unsafeCSS } from 'lit-element';
import { MutantResult } from 'mutation-testing-report-schema';
import { bootstrap } from '../../style';
import style from './mutation-test-report-state-filter.scss';
import { createCustomEvent } from '../../lib/custom-events';
import { repeat } from 'lit-html/directives/repeat';

export interface StateFilter<TStatus> {
  status: TStatus;
  count: number;
  enabled: boolean;
  label: string;
  context: string;
}

@customElement('mutation-test-report-state-filter')
export class MutationTestReportFileStateFilterComponent<TStatus> extends LitElement {
  @property()
  public mutants: ReadonlyArray<Pick<MutantResult, 'status'>> = [];

  @property()
  private get collapseButtonText() {
    if (this.collapsed) {
      return 'Expand all';
    } else {
      return 'Collapse all';
    }
  }

  @property()
  private collapsed = true;

  @property({ type: Array })
  public filters!: StateFilter<TStatus>[];

  @property({ type: Boolean, attribute: 'allow-toggle-all', reflect: true })
  public allowToggleAll = false;

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
    this.dispatchEvent(createCustomEvent('filters-changed', this.filters));
  }

  private readonly toggleOpenAll = () => {
    this.collapsed = !this.collapsed;
    if (this.collapsed) {
      this.dispatchEvent(createCustomEvent('collapse-all', undefined));
    } else {
      this.dispatchEvent(createCustomEvent('expand-all', undefined));
    }
  };

  public static styles = [bootstrap, unsafeCSS(style)];

  public render() {
    return html`
      <div class="legend col-md-12 d-flex align-items-center">
        ${repeat(
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
              <span class="badge badge-${filter.context}">${filter.label} (${filter.count})</span>
            </label>
          </div>`
        )}
        ${this.allowToggleAll
          ? html`<button @click="${this.toggleOpenAll}" class="btn btn-sm btn-secondary" type="button">${this.collapseButtonText}</button>`
          : ''}
      </div>
    `;
  }
}
