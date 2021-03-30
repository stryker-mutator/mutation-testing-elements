import { customElement, LitElement, property, PropertyValues, html, unsafeCSS } from 'lit-element';
import { MutantResult } from 'mutation-testing-report-schema';
import { bootstrap } from '../../style';
import style from './mutation-test-report-state-filter.scss';
import { createCustomEvent } from '../../lib/custom-events';

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

  @property()
  public filters!: StateFilter<TStatus>[];

  public updated(changedProperties: PropertyValues) {
    if (changedProperties.has('filters')) {
      this.dispatchFiltersChangedEvent();
    }
  }

  private checkboxClicked(filter: StateFilter<TStatus>) {
    filter.enabled = !filter.enabled;
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
        ${this.filters.map(
          (filter) => html`
            <div data-status="${filter.status}" class="form-check form-check-inline">
              <label class="form-check-label">
                <input
                  class="form-check-input"
                  type="checkbox"
                  ?checked="${filter.enabled}"
                  value="${filter.status}"
                  @input="${() => this.checkboxClicked(filter)}"
                />
                <span class="badge badge-${filter.context}">${filter.label} (${filter.count})</span>
              </label>
            </div>
          `
        )}
        <button @click="${this.toggleOpenAll}" class="btn btn-sm btn-secondary" type="button">${this.collapseButtonText}</button>
      </div>
    `;
  }
}
