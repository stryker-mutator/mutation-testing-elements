import { customElement, LitElement, property, PropertyValues, html, css } from 'lit-element';
import { MutantResult, MutantStatus } from 'mutation-testing-report-schema';
import { bootstrap } from '../style';

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
    css`
      .legend{
        position: sticky;
        top: 0;
        background: #FFF;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        z-index: 10;
      }
  `, bootstrap];

  public render() {
    return html`
      <div class='row legend'>
        <form class='col-md-12' novalidate='novalidate'>
          ${this.filters.map(filter => html`
          <div class="form-check form-check-inline">
            <label class="form-check-label">
              <input class="form-check-input" type="checkbox" ?checked="${filter.enabled}" value="${filter.status}" @input="${() => this.checkboxClicked(filter)}">
              ${filter.status} (${filter.numberOfMutants})
            </label>
          </div>
          `)}
          <button @click="${this.toggleOpenAll}" class="btn btn-sm btn-secondary" type="button">${this.collapseButtonText}</button>
        </form>
      </div>
    `;
  }

}
