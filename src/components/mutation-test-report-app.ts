import { LitElement, html, property, customElement } from 'lit-element';
import { MutationTestResult } from '../api';
import { isDirectoryResult } from '../helpers';

@customElement('mutation-test-report-app')
export class MutationTestReportAppComponent extends LitElement {
  @property() public src: string | undefined;
  private errorMessage: string | undefined;
  private report: MutationTestResult | undefined;
  @property()
  private context: MutationTestResult | undefined;

  public connectedCallback() {
    super.connectedCallback();
    if (this.src) {
      this.loadData(this.src)
        .then(this.bindLocation)
        .then(this.updateLocation)
        .catch(error =>
          this.errorMessage = error.toString());
    } else {
      this.errorMessage = 'Source not set. Please point the `src` attribute to the mutation test report data.';
    }
  }

  private async loadData(src: string) {
    const res = await fetch(src);
    const reportData: MutationTestResult = await res.json();
    if (isDirectoryResult(reportData)) {
      this.report = reportData;
    } else {
      this.errorMessage = `Report data not supported: ${JSON.stringify(reportData)}`;
    }
  }

  private readonly bindLocation = () => {
    window.addEventListener('hashchange', this.updateLocation);
  }

  private readonly updateLocation = () => {
    const hash = window.location.hash.substr(1);
    const path = hash.split('/');
    let newContext: MutationTestResult | undefined = this.report;
    let pathPart: string | undefined;
    while (pathPart = path.shift()) {
      if (isDirectoryResult(newContext)) {
        newContext = newContext.childResults.find(child => child.name === pathPart);
      } else {
        this.errorMessage = `404 - ${hash} not found`;
      }
    }
    this.context = newContext;
  }

  public render() {
    return html`
    <link rel="stylesheet" href="/dist/css/bootstrap.min.css">
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          ${this.renderErrorMessage()}
          ${this.renderMutationTestReport()}
        </div>
      </div>
    </div>
    `;
  }

  private renderErrorMessage() {
    if (this.errorMessage) {
      return html`
      <div class="alert alert-danger" role="alert">
        ${this.errorMessage}
      </div>
        `;
    } else {
      return html``;
    }
  }

  private renderMutationTestReport() {
    if (this.context) {
      return html`<mutation-test-report-result .model="${this.context}"></mutation-test-report-result>`;
    } else {
      return html``;
    }
  }
}
