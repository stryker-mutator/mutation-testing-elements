import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MetricsResult } from 'mutation-testing-metrics';
import { Thresholds } from 'mutation-testing-report-schema/api';
import { toAbsoluteUrl } from '../../lib/html-helpers';
import { bootstrap } from '../../style';
import style from './metrics-table.scss';

export type TableWidth = 'normal' | 'large';

export type ColumnCategory = 'percentage' | 'number';

export type Numbers<TMetrics> = { [Prop in keyof TMetrics as TMetrics[Prop] extends number ? Prop : never]: TMetrics[Prop] };

export interface Column<TMetric> {
  key: keyof Numbers<TMetric> & keyof TMetric;
  label: string;
  tooltip?: string;
  width?: TableWidth;
  category: ColumnCategory;
  isBold?: true;
}

@customElement('mte-metrics-table')
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
      ? html`<table class="table table-hover table-no-top">${this.renderTableHeadRow()}${this.renderTableBody(this.model)}</table>`
      : ''}`;
  }

  private renderTableHeadRow() {
    return html`<thead>
      <th scope="col" colspan="2" style="width: 217px">
        <div
          ><span>File / Directory</span
          ><a
            href="https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics"
            target="_blank"
            class="info-icon"
            title="What does this all mean?"
            >ℹ</a
          ></div
        >
      </th>
      ${this.columns.map((column) => this.renderTableHead(column))}
    </thead>`;
  }

  private renderTableHead(column: Column<TMetric>) {
    const id = `tooltip-${column.key.toString()}`;
    const header = column.tooltip
      ? html`<mte-tooltip title="${column.tooltip}" id="${id}">${column.label}</mte-tooltip>`
      : html`<span id="${id}">${column.label}</span>`;
    if (column.category === 'percentage') {
      return html` <th colspan="2"> ${header} </th>`;
    }
    return html`<th class="rotate text-center" style="width: ${column.width === 'large' ? 70 : 50}px">
      <div>${header}</div>
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
    return html`<tr title="${row.name}" class="align-middle">
      <td style="width: 32px;" class="icon"><mte-file-icon file-name="${row.name}" ?file="${row.file}"></mte-file-icon></td>
      <td>${path.length > 0 ? html`<a href="${toAbsoluteUrl(...path)}">${name}</a>` : html`<span>${row.name}</span>`}</td>
      ${this.columns.map((column) => this.renderCell(column, row.metrics))}
    </tr>`;
  }

  private renderCell(column: Column<TMetric>, metrics: TMetric) {
    const value = metrics[column.key] as unknown as number;

    if (column.category === 'percentage') {
      const valueIsPresent = !isNaN(value);
      const coloringClass = this.determineColoringClass(value);
      const mutationScoreRounded = value.toFixed(2);
      const progressBarStyle = `width: ${value}%`;

      return html`<td>
          ${valueIsPresent
            ? html` <div class="progress">
                <div
                  class="progress-bar bg-${coloringClass}"
                  role="progressbar"
                  aria-valuenow="${mutationScoreRounded}"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-describedby="tooltip-mutationScore"
                  title="${column.label}"
                  style="${progressBarStyle}"
                >
                  ${mutationScoreRounded}%
                </div>
              </div>`
            : html` <span class="fw-bold text-muted">N/A</span> `}
        </td>
        <td style="width: 50px;" class="fw-bold text-center text-${coloringClass}">${valueIsPresent ? mutationScoreRounded : undefined}</td>`;
    }
    return html`<td class="text-center ${column.isBold ? 'fw-bold' : ''}" aria-describedby="${`tooltip-${column.key.toString()}`}">${value}</td>`;
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
