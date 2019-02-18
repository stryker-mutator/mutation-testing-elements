import { LitElement, html, property, customElement, css } from 'lit-element';
import { MutationTestResult, MutationResultHealth } from '../api';
import { isDirectoryResult } from '../helpers';
import { bootstrap } from '../style';

@customElement('mutation-test-report-totals')
export class MutationTestReportTotalsComponent extends LitElement {
  @property()
  public model!: MutationTestResult;

  @property()
  private get childResults(): MutationTestResult[] {
    if (isDirectoryResult(this.model)) {
      return this.model.childResults;
    } else {
      return [];
    }
  }

  public connectedCallback() {
    super.connectedCallback();
  }

  public static styles = [css`
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
  `, bootstrap];

  public render() {
    return html`
          <table class='table table-sm table-hover table-bordered table-no-top'>
            ${this.renderHead()}
            ${this.renderBody()}
          </table>
      `;
  }

  private renderHead() {
    return html`<thead>
  <tr>
    <th style='width: 20%'>
      <div><span>File / Directory</span></div>
    </th>
    <th colspan='2'>
      <div><span>Mutation score</span></div>
    </th>
    ${this.renderTotalsColumns()}
  </tr>
</thead>`;
  }

  private renderBody() {
    return html`
    <tbody>
      ${this.renderRow(this.model, false)}
      ${this.childResults.map(child => html`${this.renderRow(child, true)}`)}
    </tbody>`;
  }

  private renderRow(subject: MutationTestResult, hyperlink: boolean) {
    const mutationScoreRounded = subject.mutationScore.toFixed(2);
    const coloringClass = this.determineColoringClass(subject);
    const style = `width: ${mutationScoreRounded}%`;
    return html`
    <tr>
      <td>${hyperlink ? html`<a href="#${subject.name}">${subject.name}</a>` : html`<span>${subject.name}</span>`}</td>
      <td>
        <div class="progress">
          <div class="progress-bar bg-${coloringClass}" role="progressbar" aria-valuenow="${mutationScoreRounded}"
            aria-valuemin="0" aria-valuemax="100" .style="${style}">
            ${mutationScoreRounded}%
          </div>
        </div>
      </td>
      <th class="text-center text-${coloringClass}">${mutationScoreRounded}</th>
      ${Object.keys(this.model.totals).map(title => html`<td class="text-center">${this.model.totals[title]}</td>`)}
    </tr>
    ` ;
  }

  private renderTotalsColumns() {
    return html`
        ${Object.keys(this.model.totals).map(title => html`<th class='rotate text-center' style='width: 50px'>
          <div><span>${title}</span></div>
        </th>`)}
    `;
  }

  private determineColoringClass(subject: MutationTestResult) {
    switch (subject.health) {
      case MutationResultHealth.Danger:
        return 'danger';
      case MutationResultHealth.Good:
        return 'success';
      case MutationResultHealth.Warning:
        return 'warning';
      default:
        return 'secondary';
    }
  }

}
