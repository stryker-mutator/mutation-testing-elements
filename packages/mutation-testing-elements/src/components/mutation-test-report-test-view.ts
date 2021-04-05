import { customElement, html, LitElement, property, PropertyValues } from 'lit-element';
import { MetricsResult, TestFileModel, TestMetrics, TestModel } from 'mutation-testing-metrics';
import { MteCustomEvent } from '../lib/custom-events';
import { bootstrap } from '../style';
import { DrawerMode } from './mutation-test-report-drawer/mutation-test-report-drawer.component';
import { Column } from './mutation-test-report-metrics-table/mutation-test-report-metrics-table.component';

const COLUMNS: Column<TestMetrics>[] = [
  { key: 'killing', label: '# Killing', width: 'normal', category: 'number' },
  { key: 'notKilling', label: '# Not Killing', width: 'normal', category: 'number' },
  { key: 'notCovering', label: '# Not Covering', width: 'normal', category: 'number' },
  { key: 'total', label: 'Total tests', width: 'large', category: 'number', isHeader: true },
];

@customElement('mutation-test-report-test-view')
export class MutationTestReportTestViewComponent extends LitElement {
  @property()
  public drawerMode: DrawerMode = 'closed';

  @property()
  public result!: MetricsResult<TestFileModel, TestMetrics>;

  @property({ attribute: false, reflect: false })
  public path!: string[];

  @property()
  private selectedTest?: TestModel;

  public static styles = [bootstrap];

  private handleClick = () => {
    // Close the drawer if the user clicks anywhere in the report (that didn't handle the click already)
    this.drawerMode = 'closed';
  };

  private handleTestSelected = (event: MteCustomEvent<'test-selected'>) => {
    this.selectedTest = event.detail.test;
    this.drawerMode = event.detail.selected ? 'half' : 'closed';
  };

  public updated(changes: PropertyValues) {
    if (changes.has('result') && !this.result.file) {
      this.drawerMode = 'closed';
    }
  }

  public render() {
    return html`
      <main @click="${this.handleClick}">
        <div class="row">
          <div class="totals col-sm-11">
            <mutation-test-report-metrics-table .columns="${COLUMNS}" .currentPath="${this.path}" .model="${this.result}">
            </mutation-test-report-metrics-table>
          </div>
        </div>
        ${this.result.file
          ? html`<mutation-test-report-test-file
              @test-selected="${this.handleTestSelected}"
              .model="${this.result.file}"
            ></mutation-test-report-test-file>`
          : ''}
      </main>
      <mutation-test-report-drawer-test .mode="${this.drawerMode}" .test="${this.selectedTest}"></mutation-test-report-drawer-test>
    `;
  }
}
