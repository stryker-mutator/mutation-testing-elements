import { LitElement, html, property, customElement } from 'lit-element';
import { MutationTestResult } from '../../api';
import { isFileResult } from '../helpers';
import { bootstrap } from '../style';

@customElement('mutation-test-report-result')
export class MutationTestReportResultComponent extends LitElement {

  @property()
  private readonly model!: MutationTestResult;

  public static styles = [bootstrap];

  public render() {
    return html`
    <div class='row'>
      <div class='totals col-sm-11'>
        <mutation-test-report-totals .model="${this.model}"></mutation-test-report-totals>
      </div>
    </div>
    ${this.renderFileResult()}
    `;
  }

  private renderFileResult() {
    if (isFileResult(this.model)) {
      return html`
        <mutation-test-report-file .model="${this.model}"></mutation-test-report-file>
      `;
    } else {
      return html``;
    }
  }
}
