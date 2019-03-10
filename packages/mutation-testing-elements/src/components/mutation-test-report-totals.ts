import { LitElement, html, property, customElement, css } from 'lit-element';
import { bootstrap } from '../style';
import { FileResultModel, DirectoryResultModel } from '../model';
import { Thresholds } from 'mutation-testing-report-schema';
import * as svg from './svg';
import { pathJoin } from '../lib/helpers';
import { ResultModel } from '../model/ResultModel';

@customElement('mutation-test-report-totals')
export class MutationTestReportTotalsComponent extends LitElement {

  @property()
  public model: FileResultModel | DirectoryResultModel | undefined;

  @property()
  public thresholds: Thresholds | undefined;

  public static styles = [bootstrap,
    css`
    th.rotate {
      /* Something you can count on */
      height: 50px;
      white-space: nowrap;
      padding-bottom: 10px;
    }

    th.rotate > div {
      transform:
      translate(27px, 0px)
      rotate(325deg);
      width: 30px;
    }

    .table-no-top>thead>tr>th {
      border-width: 0;
    }

    .table-no-top {
      border-width: 0;
    }

    .table .no-border-right {
      border-right: none;
    }
    .table .no-border-left {
      border-left: none;
    }

    table td.icon {
      color: rgba(3,47,98,.55);
      padding-left: 10px;
      padding-right: 2px;
    }

    .octicon {
      fill: currentColor;
    }

    table th.vertical-middle, table td.vertical-middle {
      vertical-align: middle;
    }
  `];

  public render() {
    if (this.model) {
      return html`
          <table class="table table-sm table-hover table-bordered table-no-top">
            ${this.renderHead()}
            ${this.renderTableBody(this.model)}
          </table>
      `;
    } else {
      return undefined;
    }
  }

  private renderHead() {
    return html`<thead>
  <tr>
    <th colspan="2" style="width: 217px">
      <div><span>File / Directory</span></div>
    </th>
    <th colspan="2">
      <div><span>Mutation score</span></div>
    </th>
    <th class="rotate text-center" style="width: 50px">
      <div><span># Killed</span></div>
    </th>
    <th class="rotate text-center" style="width: 50px">
      <div><span># Survived</span></div>
    </th>
    <th class="rotate text-center" style="width: 50px">
      <div><span># Timeout</span></div>
    </th>
    <th class="rotate text-center" style="width: 50px">
      <div><span># No coverage</span></div>
    </th>
    <th class="rotate text-center" style="width: 50px">
      <div><span># Runtime errors</span></div>
    </th>
    <th class="rotate text-center" style="width: 50px">
      <div><span># Compile errors</span></div>
    </th>
    <th class="rotate rotate-width-70 text-center" style="width: 70px">
      <div><span>Total detected</span></div>
    </th>
    <th class="rotate rotate-width-70 text-center" style="width: 70px">
      <div><span>Total undetected</span></div>
    </th>
    <th class="rotate rotate-width-70 text-center" style="width: 70px">
      <div><span>Total mutants</span></div>
    </th>
  </tr>
</thead>`;
  }

  private renderTableBody(model: FileResultModel | DirectoryResultModel) {
    const renderChildren = () => {
      if (!model.representsFile) {
        return model.childResults.map(childResult => {
          let fullName: string = childResult.name;
          while (!childResult.representsFile && childResult.childResults.length === 1) {
            childResult = childResult.childResults[0];
            fullName = pathJoin(fullName, childResult.name);
          }
          return this.renderRow(fullName, childResult, true);
        });
      } else {
        return undefined;
      }
    };
    return html`
    <tbody>
      ${this.renderRow(model.name, model, false)}
      ${renderChildren()}
    </tbody>`;
  }

  private renderRow(name: string, row: ResultModel, shouldLink: boolean) {
    const mutationScoreRounded = row.totals.mutationScore.toFixed(2);
    const coloringClass = this.determineColoringClass(row.totals.mutationScore);
    const progressBarStyle = `width: ${mutationScoreRounded}%`;
    return html`
    <tr title="${row.name}">
      <td style="width: 17px;" class="icon no-border-right">${row.representsFile ? svg.file : svg.directory}</td>
      <td width="" class="no-border-left">${shouldLink ? html`<a href="${this.link(row.path)}">${name}</a>` : html`<span>${row.name}</span>`}</td>
      <td class="no-border-right vertical-middle">
        <div class="progress">
          <div class="progress-bar bg-${coloringClass}" role="progressbar" aria-valuenow="${mutationScoreRounded}"
            aria-valuemin="0" aria-valuemax="100" .style="${progressBarStyle}">
            ${mutationScoreRounded}%
          </div>
        </div>
      </td>
      <th style="width: 50px;" class="no-border-left text-center text-${coloringClass}">${mutationScoreRounded}</th>
      <td class="text-center">${row.totals.killed}</td>
      <td class="text-center">${row.totals.survived}</td>
      <td class="text-center">${row.totals.timeout}</td>
      <td class="text-center">${row.totals.noCoverage}</td>
      <td class="text-center">${row.totals.runtimeErrors}</td>
      <td class="text-center">${row.totals.compileErrors}</td>
      <th class="text-center">${row.totals.totalDetected}</th>
      <th class="text-center">${row.totals.totalUndetected}</th>
      <th class="text-center">${row.totals.totalMutants}</th>
    </tr>`;
  }

  private link(to: string) {
    return `#${to}`;
  }

  private determineColoringClass(score: number) {
    if (this.thresholds) {
      if (score < this.thresholds.low) {
        return 'danger';
      } else if (score < this.thresholds.high) {
        return 'warning';
      } else {
        return 'success';
      }
    } else {
      return 'default';
    }
  }
}
