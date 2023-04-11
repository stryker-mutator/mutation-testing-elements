import { html, LitElement, nothing, PropertyValues, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { FileUnderTestModel, Metrics, MetricsResult } from 'mutation-testing-metrics';
import { MutantResult as MutantModel, Thresholds } from 'mutation-testing-report-schema/api';
import { MteCustomEvent } from '../../lib/custom-events';
import { tailwind } from '../../style';
import { DrawerMode } from '../drawer/drawer.component';
import { Column } from '../metrics-table/metrics-table.component';
import style from './mutant-view.scss';

@customElement('mte-mutant-view')
export class MutationTestReportMutantViewComponent extends LitElement {
  @property()
  public drawerMode: DrawerMode = 'closed';

  @property()
  private selectedMutant?: MutantModel;

  public static styles = [unsafeCSS(style), tailwind];

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
        <mte-metrics-table .columns="${COLUMNS}" .currentPath="${this.path}" .thresholds="${this.thresholds}" .model="${this.result}">
        </mte-metrics-table>
        ${this.result.file ? html`<mte-file @mutant-selected="${this.handleMutantSelected}" .model="${this.result.file}"></mte-file>` : nothing}
      </main>
      <mte-drawer-mutant .mode="${this.drawerMode}" .mutant="${this.selectedMutant}"></mte-drawer-mutant>
    `;
  }
}

const COLUMNS: Column<Metrics>[] = [
  {
    key: 'mutationScore',
    label: 'Mutation score',
    tooltip: 'The percentage of mutants that were detected. The higher, the better!',
    category: 'percentage',
  },
  {
    key: 'killed',
    label: 'Killed',
    tooltip: 'At least one test failed while these mutants were active. This is what you want!',
    category: 'number',
  },
  {
    key: 'survived',
    label: 'Survived',
    tooltip: "All tests passed while these mutants were active. You're missing a test for them.",
    category: 'number',
  },
  {
    key: 'timeout',
    label: 'Timeout',
    tooltip: 'Running the tests while these mutants were active resulted in a timeout. For example, an infinite loop.',
    category: 'number',
  },
  {
    key: 'noCoverage',
    label: 'No coverage',
    tooltip: "These mutants aren't covered by one of your tests and survived as a result.",
    category: 'number',
  },
  {
    key: 'ignored',
    label: 'Ignored',
    tooltip: "These mutants weren't tested because they are ignored. Either by user action, or for another reason.",
    category: 'number',
  },
  {
    key: 'runtimeErrors',
    label: 'Runtime errors',
    tooltip: 'Running tests when these mutants are active resulted in an error (rather than a failed test). For example: an out of memory error.',
    category: 'number',
  },
  { key: 'compileErrors', label: 'Compile errors', tooltip: 'Mutants that caused a compile error.', category: 'number' },
  {
    key: 'totalDetected',
    label: 'Detected',
    tooltip: 'The number of mutants detected by your tests (killed + timeout).',
    category: 'number',
    width: 'large',
    isBold: true,
  },
  {
    key: 'totalUndetected',
    label: 'Undetected',
    tooltip: 'The number of mutants that are not detected by your tests (survived + no coverage).',
    category: 'number',
    width: 'large',
    isBold: true,
  },
  {
    key: 'totalMutants',
    label: 'Total',
    tooltip: 'All mutants (valid + invalid + ignored + pending)',
    category: 'number',
    width: 'large',
    isBold: true,
  },
];
