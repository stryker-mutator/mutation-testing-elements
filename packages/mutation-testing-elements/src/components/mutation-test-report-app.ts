import { LitElement, html, property, customElement, css, PropertyValues } from 'lit-element';
import { MutationTestResult } from 'mutation-testing-report-schema';
import { normalizeFileNames } from '../helpers';
import { bootstrap } from '../style';
import { ResultModel } from '../model/ResultModel';
import { toDirectoryModel } from '../model';
import { PathChangedEvent } from './mutation-test-report-router';

@customElement('mutation-test-report-app')
export class MutationTestReportAppComponent extends LitElement {

  @property({ attribute: false })
  public report: MutationTestResult | undefined;

  @property({ attribute: false })
  public rootModel: ResultModel | undefined;

  @property()
  public src: string | undefined;

  @property({ attribute: false })
  public errorMessage: string | undefined;

  @property({ attribute: false })
  public context: ResultModel | undefined;

  @property()
  public path: ReadonlyArray<string> = [];

  @property({ attribute: 'title-postfix' })
  public titlePostfix: string | undefined;

  @property()
  public get title(): string {
    if (this.context) {
      if (this.titlePostfix) {
        return `${this.context.name} - ${this.titlePostfix}`;
      } else {
        return this.context.name;
      }
    } else {
      return '';
    }
  }

  private async loadData() {
    if (this.src) {
      try {
        const res = await fetch(this.src);
        this.report = await res.json();
      } catch (error) {
        const e = error.toString();
        this.errorMessage = e;
      }
    }
  }

  public updated(changedProperties: PropertyValues) {
    if (changedProperties.has('report') && this.report) {
      this.updateModel(this.report);
      this.updateContext();
    }
    if (changedProperties.has('src')) {
      this.loadData();
    }
  }

  private updateModel(report: MutationTestResult) {
    this.rootModel = toDirectoryModel(normalizeFileNames(report.files));
  }

  private updateContext() {
    if (this.rootModel) {
      this.context = this.rootModel.find(this.path.join('/'));
    }
  }

  private readonly updatePath = (event: PathChangedEvent) => {
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
    <mutation-test-report-title .title="${this.title}"></mutation-test-report-title>
    <mutation-test-report-router @path-changed="${this.updatePath}"></mutation-test-report-router>
    ${this.renderContent()}
    `;
  }

  private renderTitle() {
    if (this.context) {
      return html`<h1 class="display-4">${this.title}</h1>`;
    } else {
      return undefined;
    }
  }

  private renderContent() {
    if (this.context || this.errorMessage) {
      return html`<div class="container">
  <div class="row">
    <div class="col-md-12">
      ${this.renderReport()}
      ${this.renderErrorMessage()}
    </div>
  </div>
</div>`;
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

  private renderReport() {
    if (this.context) {
      return html`
      ${this.renderTitle()}
      <mutation-test-report-breadcrumb .path="${this.path}"></mutation-test-report-breadcrumb>
      ${this.renderTotals()}
      ${this.renderFileReport()}`;
    } else {
      return undefined;
    }
  }

  private renderFileReport() {
    if (this.context && this.report && this.context.representsFile) {
      return html`<mutation-test-report-file .model="${this.context}"></mutation-test-report-file>`;
    } else {
      return undefined;
    }
  }

  private renderTotals() {
    if (this.report && this.context) {
      return html`
    <div class='row'>
      <div class='totals col-sm-11'>
        <mutation-test-report-totals .thresholds="${this.report.thresholds}" .model="${this.context}"></mutation-test-report-totals>
      </div>
    </div>
    `;
    } else {
      return undefined;
    }
  }
}
