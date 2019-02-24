import { LitElement, html, property, customElement, css } from 'lit-element';
import { bootstrap } from '../style';
import { ResultTable, TableRow } from '../model/ResultTable';

@customElement('mutation-test-report-totals')
export class MutationTestReportTotalsComponent extends LitElement {

  @property()
  public model!: ResultTable;

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
  `];

  public render() {
    return html`
          <table class="table table-sm table-hover table-bordered table-no-top">
            ${this.renderHead()}
            ${this.renderBody()}
          </table>
      `;
  }

  private renderHead() {
    return html`<thead>
  <tr>
    <th style="width: 20%">
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

  private renderBody() {
    return html`
    <tbody>
      ${this.model.rows.map(this.renderRow)}
    </tbody>`;
  }

  private readonly renderRow = (row: TableRow) => {
    const mutationScoreRounded = row.mutationScore.toFixed(2);
    const coloringClass = this.determineColoringClass(row.mutationScore);
    const style = `width: ${mutationScoreRounded}%`;
    return html`
    <tr>
      <td>${row.shouldLink ? html`<a href="${this.link(row.name)}">${row.name}</a>` : html`<span>${row.name}</span>`}</td>
      <td>
        <div class="progress">
          <div class="progress-bar bg-${coloringClass}" role="progressbar" aria-valuenow="${mutationScoreRounded}"
            aria-valuemin="0" aria-valuemax="100" .style="${style}">
            ${mutationScoreRounded}%
          </div>
        </div>
      </td>
      <th class="text-center text-${coloringClass}">${mutationScoreRounded}</th>
      <td class="text-center">${row.killed}</td>
      <td class="text-center">${row.survived}</td>
      <td class="text-center">${row.timeout}</td>
      <td class="text-center">${row.noCoverage}</td>
      <td class="text-center">${row.runtimeErrors}</td>
      <td class="text-center">${row.compileErrors}</td>
      <th class="text-center">${row.totalDetected}</th>
      <th class="text-center">${row.totalUndetected}</th>
      <th class="text-center">${row.totalMutants}</th>
    </tr>
    ` ;
  }

  private link(to: string) {
    return `#${to}`;
  }

  private determineColoringClass(score: number) {
    if (score < this.model.thresholds.low) {
      return 'danger';
    } else if (score < this.model.thresholds.high) {
      return 'warning';
    } else {
      return 'success';
    }
  }

}
