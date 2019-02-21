import { LitElement, html, property, customElement } from 'lit-element';
import { MutationTestResult } from '../../api';
import { bootstrap } from '../style';
import { ResultTable, TableRow } from '../model/ResultTable';
import { ROOT_NAME, flatMap } from '../helpers';

@customElement('mutation-test-report-result')
export class MutationTestReportResultComponent extends LitElement {

  @property()
  private readonly model!: MutationTestResult;

  public static styles = [bootstrap];

  public render() {
    const rows = [
      new TableRow(ROOT_NAME, flatMap(Object.keys(this.model.files), key => this.model.files[key].mutants), false),
      ...Object.keys(this.model.files).map(fileName => new TableRow(fileName, this.model.files[fileName].mutants, true))
    ];
    return html`
    <div class='row'>
      <div class='totals col-sm-11'>
        <mutation-test-report-totals .model="${new ResultTable(rows, this.model.thresholds)}"></mutation-test-report-totals>
      </div>
    </div>
    `;
  }
}
