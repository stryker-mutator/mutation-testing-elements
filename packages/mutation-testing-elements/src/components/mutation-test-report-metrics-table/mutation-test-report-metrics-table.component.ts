import { customElement, html, LitElement, property, unsafeCSS } from 'lit-element';
import { MetricsResult } from 'mutation-testing-metrics';
import { Thresholds } from 'mutation-testing-report-schema';
import { toAbsoluteUrl } from '../../lib/htmlHelpers';
import { bootstrap } from '../../style';
import style from './mutation-test-report-metrics-table.scss';

export type TableWidth = 'normal' | 'large';

export type ColumnCategory = 'percentage' | 'number';

export type Numbers<TMetrics> = { [Prop in keyof TMetrics as TMetrics[Prop] extends number ? Prop : never]: TMetrics[Prop] };

export interface Column<TMetric> {
  key: keyof Numbers<TMetric> & keyof TMetric;
  label: string;
  width?: TableWidth;
  category: ColumnCategory;
  isHeader?: true;
}

@customElement('mutation-test-report-metrics-table')
export class MutationTestReportTestMetricsTable<TFile, TMetric> extends LitElement {
  @property()
  public model?: MetricsResult<TFile, TMetric>;

  @property()
  public currentPath: string[] = [];

  public static styles = [bootstrap, unsafeCSS(style)];

  @property({ type: Array })
  public columns!: Column<TMetric>[];

  @property()
  public thresholds: Thresholds = {
    high: 80,
    low: 60,
  };

  public render() {
    return html`${this.model
      ? html`<table class="table table-sm table-hover table-bordered table-no-top"
          >${this.renderTableHeadRow()}${this.renderTableBody(this.model)}</table
        >`
      : ''}`;
  }

  private renderTableHeadRow() {
    return html`<thead>
      <th colspan="2" style="width: 217px">
        <div><span>File / Directory</span></div>
      </th>
      ${this.columns.map((column) => this.renderTableHead(column))}
    </thead>`;
  }

  private renderTableHead(column: Column<TMetric>) {
    if (column.category === 'percentage') {
      return html` <th colspan="2"> ${column.label} </th>`;
    }
    return html`<th class="rotate text-center" style="width: ${column.width === 'large' ? 70 : 50}px">
      <div><span>${column.label}</span></div>
    </th>`;
  }

  private renderTableBody(model: MetricsResult<TFile, TMetric>) {
    const renderChildren = () => {
      if (model.file) {
        return undefined;
      } else {
        return model.childResults.map((childResult) => {
          const nameParts: string[] = [childResult.name];
          while (!childResult.file && childResult.childResults.length === 1) {
            childResult = childResult.childResults[0];
            nameParts.push(childResult.name);
          }
          return this.renderRow(nameParts.join('/'), childResult, ...this.currentPath, ...nameParts);
        });
      }
    };
    return html`<tbody>${this.renderRow(model.name, model)} ${renderChildren()}</tbody>`;
  }

  private renderRow(name: string, row: MetricsResult<TFile, TMetric>, ...path: string[]) {
    return html`<tr title="${row.name}">
      <td style="width: 32px;" class="icon no-border-right"
        ><mutation-test-report-file-icon file-name="${row.name}" ?file="${row.file}"></mutation-test-report-file-icon
      ></td>
      <td class="no-border-left">${path.length > 0 ? html`<a href="${toAbsoluteUrl(...path)}">${name}</a>` : html`<span>${row.name}</span>`}</td>
      ${this.columns.map((column) => this.renderCell(column, row.metrics))}
    </tr>`;
  }

  private renderCell(column: Column<TMetric>, metrics: TMetric) {
    const value = (metrics[column.key] as unknown) as number;

    if (column.category === 'percentage') {
      const valueIsPresent = !isNaN(value);
      const coloringClass = this.determineColoringClass(value);
      const mutationScoreRounded = value.toFixed(2);
      const progressBarStyle = `width: ${value}%`;

      return html`<td class="no-border-right vertical-middle">
          ${valueIsPresent
            ? html` <div class="progress">
                <div
                  class="progress-bar bg-${coloringClass}"
                  role="progressbar"
                  aria-valuenow="${mutationScoreRounded}"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  style="${progressBarStyle}"
                >
                  ${mutationScoreRounded}%
                </div>
              </div>`
            : html` <span class="font-weight-bold text-muted">N/A</span> `}
        </td>
        <td style="width: 50px;" class="no-border-left font-weight-bold text-center text-${coloringClass}">
          ${valueIsPresent ? mutationScoreRounded : undefined}
        </td>`;
    }
    return column.isHeader ? html`<th class="text-center">${value}</th>` : html`<td class="text-center">${value}</td>`;
  }
  private determineColoringClass(mutationScore: number) {
    if (!isNaN(mutationScore) && this.thresholds) {
      if (mutationScore < this.thresholds.low) {
        return 'danger';
      } else if (mutationScore < this.thresholds.high) {
        return 'warning';
      } else {
        return 'success';
      }
    } else {
      return 'default';
    }
  }
}
