import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MetricsResult } from 'mutation-testing-metrics';
import { Thresholds } from 'mutation-testing-report-schema/api';
import { toAbsoluteUrl } from '../../lib/html-helpers';

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

  @property({ type: Array })
  public columns!: Column<TMetric>[];

  @property()
  public thresholds: Thresholds = {
    high: 80,
    low: 60,
  };

  /**
   * Disable shadow-DOM for this component to let parent styles apply (such as dark theme)
   */
  protected override createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  public render() {
    return html`${this.model
      ? html`<table
          class="container table-fixed border border-slate-200 rounded-md dark:border-slate-700 transition-[max-width] bg-white dark:bg-gray-800 text-sm w-full text-left"
          >${this.renderTableHeadRow()}${this.renderTableBody(this.model)}
        </table>`
      : ''}`;
  }

  private renderTableHeadRow() {
    return html`<thead class="text-sm">
      <tr>
        <th scope="col" colspan="2" class="py-4 px-4">
          <span>File / Directory</span
          ><a
            href="https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics"
            target="_blank"
            class="info-icon float-right"
            title="What does this all mean?"
            >ℹ</a
          >
        </th>
        ${this.columns.map((column, i) => this.renderTableHead(column, i))}
      </tr>
    </thead>`;
  }

  private renderTableHead(column: Column<TMetric>, i: number) {
    const id = `tooltip-${column.key.toString()}`;
    const header = column.tooltip
      ? html`<mte-tooltip title="${column.tooltip}" id="${id}">${column.label}</mte-tooltip>`
      : html`<span id="${id}">${column.label}</span>`;
    if (column.category === 'percentage') {
      return html` <th colspan="2" class="px-2 bg-gray-100 dark:bg-gray-900"> ${header} </th>`;
    }
    return html`<th class="px-2 w-auto whitespace-nowrap ${i % 2 === 0 ? 'bg-gray-100 dark:bg-gray-900' : ''}">
      <div class="inline-block">${header}</div>
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
    return html`<tr title="${row.name}" class="border-b last:border-none dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-slate-700">
      <td class="px-4 w-4"><mte-file-icon file-name="${row.name}" ?file="${row.file}"></mte-file-icon></td>
      <td class="font-semibold text-gray-900 dark:text-white"
        >${path.length > 0
          ? html`<a class="py-4 inline-block hover:text-blue-600 dark:hover:text-blue-500 hover:underline" href="${toAbsoluteUrl(...path)}"
              >${name}</a
            >`
          : html`<span class="py-4">${row.name}</span>`}</td
      >
      ${this.columns.map((column, i) => this.renderCell(column, row.metrics, i))}
    </tr>`;
  }

  private renderCell(column: Column<TMetric>, metrics: TMetric, i: number) {
    const value = metrics[column.key] as unknown as number;

    if (column.category === 'percentage') {
      const valueIsPresent = !isNaN(value);
      const bgColoringClass = this.determineBgColoringClass(value);
      const textColoringClass = this.determineTextColoringClass(value);
      const mutationScoreRounded = value.toFixed(2);
      const progressBarStyle = `width: ${value}%`;

      return html`<td class="py-4 px-2 ${i % 2 === 0 ? 'bg-gray-100 dark:bg-gray-900' : ''} ">
          ${valueIsPresent
            ? html`<div class="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                <div
                  class="${bgColoringClass} pl-1 rounded-full h-3"
                  role="progressbar"
                  aria-valuenow="${mutationScoreRounded}"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-describedby="tooltip-mutationScore"
                  title="${column.label}"
                  style="${progressBarStyle}"
                ></div>
              </div>`
            : html` <span class="font-bold text-light-muted dark:text-dark-muted">N/A</span> `}
        </td>
        <td class="pr-2 w-12 font-bold text-center ${textColoringClass} ${i % 2 === 0 ? 'bg-gray-100 dark:bg-gray-900' : ''}"
          >${valueIsPresent ? mutationScoreRounded : undefined}</td
        >`;
    }
    return html`<td
      class="${i % 2 === 0 ? 'bg-gray-100 dark:bg-gray-900' : ''} text-center py-4 ${column.isBold ? 'font-bold' : ''}"
      aria-describedby="${`tooltip-${column.key.toString()}`}"
      >${value}</td
    >`;
  }
  private determineBgColoringClass(mutationScore: number) {
    if (!isNaN(mutationScore) && this.thresholds) {
      if (mutationScore < this.thresholds.low) {
        return 'bg-red-600 dark:bg-red-500 text-gray-200 dark:text-gray-800';
      } else if (mutationScore < this.thresholds.high) {
        return 'bg-yellow-400 dark:text-gray-800';
      } else {
        return 'bg-green-600 dark:bg-green-500 text-gray-200 dark:text-gray-800';
      }
    } else {
      return 'bg-blue-600';
    }
  }
  private determineTextColoringClass(mutationScore: number) {
    if (!isNaN(mutationScore) && this.thresholds) {
      if (mutationScore < this.thresholds.low) {
        return 'text-red-600 dark:text-red-500';
      } else if (mutationScore < this.thresholds.high) {
        return 'text-yellow-600 dark:text-yellow-500';
      } else {
        return 'text-green-700 dark:text-green-500';
      }
    } else {
      return '';
    }
  }
}
