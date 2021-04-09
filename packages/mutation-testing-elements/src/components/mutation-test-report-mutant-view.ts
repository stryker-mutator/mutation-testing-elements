import { customElement, html, LitElement, property, PropertyValues } from 'lit-element';
import { FileUnderTestModel, Metrics, MetricsResult } from 'mutation-testing-metrics';
import { MutantResult as MutantModel, Thresholds } from 'mutation-testing-report-schema';
import { MteCustomEvent } from '../lib/custom-events';
import { bootstrap } from '../style';
import { DrawerMode } from './mutation-test-report-drawer/mutation-test-report-drawer.component';
import { Column } from './mutation-test-report-metrics-table/mutation-test-report-metrics-table.component';

const COLUMNS: Column<Metrics>[] = [
  { key: 'mutationScore', label: 'Mutation score', category: 'percentage' },
  { key: 'killed', label: '# Killed', category: 'number' },
  { key: 'survived', label: '# Survived', category: 'number' },
  { key: 'timeout', label: '# Timeout', category: 'number' },
  { key: 'noCoverage', label: '# No coverage', category: 'number' },
  { key: 'ignored', label: '# Ignored', category: 'number' },
  { key: 'runtimeErrors', label: '# Runtime errors', category: 'number' },
  { key: 'compileErrors', label: '# Compile errors', category: 'number' },
  { key: 'totalDetected', label: 'Total detected', category: 'number', width: 'large', isHeader: true },
  { key: 'totalUndetected', label: 'Total undetected', category: 'number', width: 'large', isHeader: true },
  { key: 'totalMutants', label: 'Total mutants', category: 'number', width: 'large', isHeader: true },
];

@customElement('mutation-test-report-mutant-view')
export class MutationTestReportMutantViewComponent extends LitElement {
  @property()
  public drawerMode: DrawerMode = 'closed';

  @property()
  private selectedMutant?: MutantModel;

  public static styles = [bootstrap];

  @property()
  public result!: MetricsResult<FileUnderTestModel, Metrics>;

  @property({ attribute: false, reflect: false })
  public thresholds!: Thresholds;

  @property({ attribute: false, reflect: false })
  public path!: string[];

  private handleClick = () => {
    // Close the drawer if the user clicks anywhere in the report (that didn't handle the click already)
    this.drawerMode = 'closed';
  };

  private handleMutantSelected = (event: MteCustomEvent<'mutant-selected'>) => {
    this.selectedMutant = event.detail.mutant;
    this.drawerMode = event.detail.selected ? 'half' : 'closed';
  };

  updated(changes: PropertyValues) {
    if (changes.has('result') && !this.result.file) {
      this.drawerMode = 'closed';
    }
  }

  public render() {
    return html`
      <main @click="${this.handleClick}">
        <div class="row">
          <div class="totals col-sm-11">
            <mutation-test-report-metrics-table 
            .columns="${COLUMNS}" 
            .currentPath="${this.path}"
            .thresholds="${this.thresholds}"
            .model="${this.result}">
            </mutation-test-report-metrics-table>
          </div>
        </div>
        ${
          this.result.file
            ? html`<mutation-test-report-file
                @mutant-selected="${this.handleMutantSelected}"
                .model="${this.result.file}"
              ></mutation-test-report-file>`
            : ''
        }
      </mutation-test-report-file>
      </main>
      <mutation-test-report-drawer-mutant .mode="${this.drawerMode}" .mutant="${this.selectedMutant}"></mutation-test-report-drawer-mutant>
    `;
  }
}
