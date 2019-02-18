import { LitElement, html, property, customElement, css, unsafeCSS } from 'lit-element';
import { MutationTestResult } from '../api';
import { isDirectoryResult } from '../helpers';
import { bootstrap } from '../style';

@customElement('mutation-test-report-app')
export class MutationTestReportAppComponent extends LitElement {
  private report: MutationTestResult | undefined;

  @property()
  public src: string | undefined;

  @property()
  public errorMessage: string | undefined;

  @property()
  public context: MutationTestResult | undefined;

  @property()
  public path: ReadonlyArray<string> | undefined;

  public connectedCallback() {
    super.connectedCallback();
    if (this.src) {
      this.loadData(this.src)
        .catch(error =>
          this.errorMessage = error.toString());
    } else {
      this.errorMessage = 'Source not set. Please point the `src` attribute to the mutation test report data.';
    }
  }

  private async loadData(src: string) {
    const res = await fetch(src);
    this.report = await res.json();
    this.updateContext();
  }

  private updateContext() {
    if (this.path) {
      const pathQueue = this.path.slice();
      let newContext: MutationTestResult | undefined = this.report;
      let pathPart: string | undefined;

      while (pathPart = pathQueue.shift()) {
        if (isDirectoryResult(newContext)) {
          newContext = newContext.childResults.find(child => child.name === pathPart);
        } else {
          newContext = undefined;
          break;
        }
      }
      this.context = newContext;
      if (!this.context) {
        this.errorMessage = `404 - ${this.path.join('/')} not found`;
      } else {
        this.errorMessage = undefined;
      }
    }
  }

  private readonly updatePath = (event: CustomEvent) => {
    this.path = event.detail;
    this.updateContext();
  }

  public static styles = [
    bootstrap
  ];

  public render() {
    return html`
    <mutation-test-report-router @path-changed="${this.updatePath}"></mutation-test-report-router>
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          ${this.renderTitle()}
          <mutation-test-report-breadcrumb .path="${this.path}"></mutation-test-report-breadcrumb>
          ${this.renderErrorMessage()}
          ${this.renderMutationTestReport()}
        </div>
      </div>
    </div>
    `;
  }

  private renderTitle() {
    if (this.context) {
      return html`<h1 class="display-1">${this.context.name}</h1>`;
    } else {
      return undefined;
    }
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
      return '';
    }
  }
}
