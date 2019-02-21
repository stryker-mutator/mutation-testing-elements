import { LitElement, html, property, customElement, css, unsafeCSS } from 'lit-element';
import { MutationTestResult, FileResult } from '../../api';
import { ROOT_NAME, normalizeFileNames } from '../helpers';
import { bootstrap } from '../style';

@customElement('mutation-test-report-app')
export class MutationTestReportAppComponent extends LitElement {
  @property()
  private report: MutationTestResult | undefined;

  @property()
  public src: string | undefined;

  @property()
  public errorMessage: string | undefined;

  @property()
  public context: FileResult | undefined;

  @property()
  public path: string | undefined;

  @property()
  public get title(): string {
    if (this.context && this.path) {
      return this.path;
    } else {
      return ROOT_NAME;
    }
  }

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
    const report: MutationTestResult = await res.json();
    report.files = normalizeFileNames(report.files);
    this.report = report;
    this.updateContext();
  }

  private updateContext() {
    if (this.report) {
      if (this.path) {
        this.context = this.report.files[this.path];
        if (!this.context) {
          this.errorMessage = `404 - ${this.path} not found`;
        } else {
          this.errorMessage = undefined;
        }
      } else {
        this.context = undefined;
      }
    }
  }

  private readonly updatePath = (event: CustomEvent) => {
    this.path = event.detail;
    this.updateContext();
  }

  public static styles = [
    bootstrap,
    css`
    :host {
      line-height: 1.15;
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
      font-size: 1rem;
      font-weight: 400;
      line-height: 1.5;
      color: #212529;
      text-align: left;
      background-color: #fff;
    }
    `
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
    if (this.report) {
      return html`<h1 class="display-4">${this.title}</h1>`;
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
    if (this.context && this.report) {
      return html`<mutation-test-report-file .name="${this.title}" .thresholds="${this.report.thresholds}" .model="${this.context}"></mutation-test-report-file>`;
    } else if (this.report) {
      return html`<mutation-test-report-result .model="${this.report}"></mutation-test-report-result>`;
    } else {
      return '';
    }
  }
}
