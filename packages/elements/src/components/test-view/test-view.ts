import { html, nothing, PropertyValues, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MetricsResult, TestFileModel, TestMetrics, TestModel } from 'mutation-testing-metrics';
import { MteCustomEvent } from '../../lib/custom-events';
import { tailwind } from '../../style';
import { DrawerMode } from '../drawer/drawer.component';
import { Column } from '../metrics-table/metrics-table.component';
import style from './test-view.scss';
import { RealTimeElement } from '../real-time-element';

@customElement('mte-test-view')
export class MutationTestReportTestViewComponent extends RealTimeElement {
  @property()
  public declare drawerMode: DrawerMode;

  @property()
  public declare result: MetricsResult<TestFileModel, TestMetrics>;

  @property({ attribute: false, reflect: false })
  public declare path: string[];

  @property()
  private declare selectedTest?: TestModel;

  public static styles = [unsafeCSS(style), tailwind];

  constructor() {
    super();
    this.drawerMode = 'closed';
  }

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
        <mte-metrics-table .columns="${COLUMNS}" .currentPath="${this.path}" .model="${this.result}"> </mte-metrics-table>
        ${this.result.file ? html`<mte-test-file @test-selected="${this.handleTestSelected}" .model="${this.result.file}"></mte-test-file>` : nothing}
      </main>
      <mte-drawer-test .mode="${this.drawerMode}" .test="${this.selectedTest}"></mte-drawer-test>
    `;
  }
}

const COLUMNS: Column<TestMetrics>[] = [
  { key: 'killing', label: 'Killing', tooltip: 'These tests killed at least one mutant', width: 'normal', category: 'number' },
  {
    key: 'covering',
    label: 'Covering',
    tooltip: 'These tests are covering at least one mutant, but not killing any of them.',
    width: 'normal',
    category: 'number',
  },
  {
    key: 'notCovering',
    label: 'Not Covering',
    tooltip: 'These tests were not covering a mutant (and thus not killing any of them).',
    width: 'normal',
    category: 'number',
  },
  { key: 'total', label: 'Total tests', width: 'large', category: 'number', isBold: true },
];
