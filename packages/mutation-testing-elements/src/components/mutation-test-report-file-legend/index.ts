import { customElement, LitElement, property, PropertyValues, html, unsafeCSS } from 'lit-element';
import { MutantResult, MutantStatus } from 'mutation-testing-report-schema';
import { bootstrap } from '../../style';
import { getContextClassForStatus, getEmojiForStatus } from '../../lib/htmlHelpers';

export interface MutantFilter {
  status: MutantStatus;
  numberOfMutants: number;
  enabled: boolean;
}

@customElement('mutation-test-report-file-legend')
export class MutationTestReportFileLegendComponent extends LitElement {

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
  private filters: MutantFilter[] = [];

  public updated(changedProperties: PropertyValues) {
    if (changedProperties.has('mutants')) {
      this.updateModel();
    }
  }

  private updateModel() {
    this.filters = [MutantStatus.Killed, MutantStatus.Survived, MutantStatus.NoCoverage, MutantStatus.Timeout, MutantStatus.CompileError, MutantStatus.RuntimeError]
      .filter(status => this.mutants.some(mutant => mutant.status === status))
      .map(status => ({
        enabled: [MutantStatus.Survived, MutantStatus.NoCoverage, MutantStatus.Timeout].some(s => s === status),
        numberOfMutants: this.mutants.filter(m => m.status === status).length,
        status
      }));
    this.dispatchFiltersChangedEvent();
  }

  private checkboxClicked(filter: MutantFilter) {
    filter.enabled = !filter.enabled;
    this.dispatchFiltersChangedEvent();
  }

  private dispatchFiltersChangedEvent() {
    this.dispatchEvent(new CustomEvent('filters-changed', { detail: this.filters }));
  }

  private readonly toggleOpenAll = () => {
    this.collapsed = !this.collapsed;
    if (this.collapsed) {
      this.dispatchEvent(new CustomEvent('collapse-all'));
    } else {
      this.dispatchEvent(new CustomEvent('expand-all'));
    }
  }

  public static styles = [
    bootstrap,
    unsafeCSS(require('./index.scss'))
  ];

  public render() {
    return html`
      <div class='row legend col-md-12'>
        ${this.filters.map(filter => html`
        <div data-status="${filter.status}" class="form-check form-check-inline">
          <label class="form-check-label">
            <input class="form-check-input" type="checkbox" ?checked="${filter.enabled}" value="${filter.status}" @input="${() => this.checkboxClicked(filter)}">
            <span class="badge badge-${getContextClassForStatus(filter.status)}">${getEmojiForStatus(filter.status)}
              ${filter.status} (${filter.numberOfMutants})</span>
          </label>
        </div>
        `)}
        <button @click="${this.toggleOpenAll}" class="btn btn-sm btn-secondary" type="button">${this.collapseButtonText}</button>
      </div>
    `;
  }

}
