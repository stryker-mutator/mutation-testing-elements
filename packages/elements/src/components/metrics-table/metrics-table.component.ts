import type { PropertyValues } from 'lit';
import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { map } from 'lit/directives/map.js';
import { repeat } from 'lit/directives/repeat.js';
import type { MetricsResult } from 'mutation-testing-metrics';
import type { Thresholds } from 'mutation-testing-report-schema/api';

import { toAbsoluteUrl } from '../../lib/html-helpers.js';
import { renderEmoji } from '../drawer-mutant/util.js';
import { RealTimeElement } from '../real-time-element.js';

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
  group?: string;
}

@customElement('mte-metrics-table')
export class MutationTestReportTestMetricsTable<TFile, TMetric> extends RealTimeElement {
  @property({ attribute: false })
  declare public model?: MetricsResult<TFile, TMetric>;

  @property({ attribute: false })
  declare public currentPath: string[];

  @property({ type: Array })
  declare public columns: Column<TMetric>[];

  @property({ attribute: false })
  declare public thresholds: Thresholds;

  constructor() {
    super();
    this.currentPath = [];
    this.thresholds = {
      high: 80,
      low: 60,
    };
  }

  #hasMultipleColspan = false;

  public override willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('columns')) {
      this.#hasMultipleColspan = this.columns.some((column) => column.category === 'percentage');
    }
  }

  public render() {
    return this.model
      ? html`<div class="overflow-x-auto rounded-md border border-gray-200">
          <table class="w-full table-auto text-left text-sm">${this.#renderTableHeadRow()}${this.#renderTableBody(this.model)} </table>
        </div>`
      : nothing;
  }

  #renderTableHeadRow() {
    const nonMutationScoreColumns = this.columns.filter((column) => column.group !== 'Mutation score');
    const mutationScoreColumns = this.columns.filter((column) => column.group === 'Mutation score');
    return html`<thead class="border-b border-gray-200 text-center text-sm">
      <tr>
        <th rowspan="2" scope="col" class="px-4 py-4">
          <div class="flex items-center justify-around">
            <span>File / Directory</span
            ><a
              href="https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics"
              target="_blank"
              class="info-icon float-right"
              title="What does this all mean?"
              >${renderEmoji('ℹ', 'info icon')}</a
            >
          </div>
        </th>
        ${mutationScoreColumns.length > 0 ? html`<th colspan="4" class="px-2 even:bg-gray-100">Mutation Score</th>` : ``}
        ${repeat(
          nonMutationScoreColumns,
          (column) => column.key,
          (column) => this.#renderTableHead(column),
        )}
      </tr>
      <tr>
        ${repeat(
          mutationScoreColumns,
          (column) => column.key,
          (column) => this.#renderTableHead(column),
        )}
      </tr>
    </thead>`;
  }

  #renderTableHead(column: Column<TMetric>) {
    const id = `tooltip-${column.key.toString()}`;
    const header = column.tooltip
      ? html`<mte-tooltip title="${column.tooltip}" id="${id}">${column.label}</mte-tooltip>`
      : html`<span id="${id}">${column.label}</span>`;
    if (column.group) {
      return html` <th colspan="2" class="bg-gray-200 px-2"> ${header} </th>`;
    }
    return html`<th rowspan="2" class="w-24 px-2 even:bg-gray-100 2xl:w-28">
      <div class="inline-block">${header}</div>
    </th>`;
  }

  #renderTableBody(model: MetricsResult<TFile, TMetric>) {
    const renderChildren = () => {
      if (model.file) {
        return nothing;
      } else {
        return map(model.childResults, (childResult) => {
          const nameParts: string[] = [childResult.name];
          while (!childResult.file && childResult.childResults.length === 1) {
            childResult = childResult.childResults[0];
            nameParts.push(childResult.name);
          }
          return this.#renderRow(nameParts.join('/'), childResult, ...this.currentPath, ...nameParts);
        });
      }
    };
    return html`<tbody class="divide-y divide-gray-200">${this.#renderRow(model.name, model)} ${renderChildren()}</tbody>`;
  }

  #renderRow(name: string, row: MetricsResult<TFile, TMetric>, ...path: string[]) {
    return html`<tr title="${row.name}" class="group hover:bg-gray-200">
      <td class="font-semibold">
        <div class="flex items-center justify-start">
          <mte-file-icon file-name="${row.name}" ?file="${row.file}" class="mx-1 flex items-center"></mte-file-icon> ${path.length > 0
            ? html`<a class="mr-auto inline-block w-full py-4 pr-2 hover:text-primary-on hover:underline" href="${toAbsoluteUrl(...path)}"
                >${name}</a
              >`
            : html`<span class="py-4">${row.name}</span>`}
        </div>
      </td>
      ${map(this.columns, (column) => this.#renderCell(column, row.metrics))}
    </tr>`;
  }

  #renderCell(column: Column<TMetric>, metrics: TMetric) {
    const value = metrics[column.key] as unknown as number;
    const backgroundColoringClass = this.#hasMultipleColspan ? 'odd:bg-gray-100' : 'even:bg-gray-100';

    if (column.category === 'percentage') {
      const valueIsPresent = !isNaN(value);
      const bgColoringClass = this.#determineBgColoringClass(value);
      const textColoringClass = this.#determineTextColoringClass(value);
      const mutationScoreRounded = value.toFixed(2);
      const progressBarStyle = `width: ${value}%`;

      return html`<td class="bg-gray-100 px-4 py-4 group-hover:bg-gray-200!">
          ${valueIsPresent
            ? html`<div class="h-3 w-full min-w-[24px] rounded-full bg-gray-300">
                <div
                  class="${bgColoringClass} h-3 rounded-full pl-1 transition-all"
                  role="progressbar"
                  aria-valuenow="${mutationScoreRounded}"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-describedby="tooltip-mutationScore"
                  title="${column.label}"
                  style="${progressBarStyle}"
                ></div>
              </div>`
            : html` <span class="text-light-muted font-bold">N/A</span> `}
        </td>
        <td class="${textColoringClass} ${backgroundColoringClass} w-12 pr-2 text-center font-bold group-hover:bg-gray-200!"
          >${valueIsPresent ? html`<span class="transition-colors">${mutationScoreRounded}</span>` : nothing}</td
        >`;
    }
    return html`<td
      class="${classMap({ 'font-bold': column.isBold ?? false, [backgroundColoringClass]: true })} py-4 text-center group-hover:bg-gray-200!"
      aria-describedby="${`tooltip-${column.key.toString()}`}"
      >${value}</td
    >`;
  }
  #determineBgColoringClass(mutationScore: number) {
    if (!isNaN(mutationScore) && this.thresholds) {
      if (mutationScore < this.thresholds.low) {
        return 'bg-red-600 text-gray-200';
      } else if (mutationScore < this.thresholds.high) {
        return 'bg-yellow-400';
      } else {
        return 'bg-green-600 text-gray-200';
      }
    } else {
      return 'bg-cyan-600';
    }
  }
  #determineTextColoringClass(mutationScore: number) {
    if (!isNaN(mutationScore) && this.thresholds) {
      if (mutationScore < this.thresholds.low) {
        return 'text-red-700';
      } else if (mutationScore < this.thresholds.high) {
        return 'text-yellow-600';
      } else {
        return 'text-green-700';
      }
    } else {
      return '';
    }
  }
}
