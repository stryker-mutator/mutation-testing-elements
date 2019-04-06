import { LitElement, html, property, customElement, css, PropertyValues } from 'lit-element';
import { MutationTestResult } from 'mutation-testing-report-schema';
import { MetricsResult, calculateMetrics } from 'mutation-testing-metrics';
import { bootstrap } from '../style';
import { locationChange$ } from '../lib/router';
import { Subscription } from 'rxjs';

@customElement('mutation-test-report-app')
export class MutationTestReportAppComponent extends LitElement {

  @property({ attribute: false })
  public report: MutationTestResult | undefined;

  @property({ attribute: false })
  public rootModel: MetricsResult | undefined;

  @property()
  public src: string | undefined;

  @property({ attribute: false })
  public errorMessage: string | undefined;

  @property({ attribute: false })
  public context: MetricsResult | undefined;

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
    if ((changedProperties.has('path') || changedProperties.has('report')) && this.report) {
      this.updateModel(this.report);
      this.updateContext();
      this.updateTitle();
    }
    if (changedProperties.has('src')) {
      this.loadData();
    }
  }

  private updateModel(report: MutationTestResult) {
    this.rootModel = calculateMetrics(report.files);
  }

  private updateContext() {
    if (this.rootModel) {
      // Find the current selected file/directory based on the path
      this.context = this.path.reduce<MetricsResult | undefined>(
        (model, currentPathPart) => model && model.childResults.find(child => child.name === currentPathPart),
        this.rootModel);
    }
  }

  private updateTitle() {
    document.title = this.title;
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

    .display-4 small {
      font-weight: 300;
    }
    `
  ];

  public readonly subscriptions: Subscription[] = [];
  public connectedCallback() {
    super.connectedCallback();
    this.subscriptions.push(locationChange$.subscribe(path => this.path = path));
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private renderTitle() {
    const self = this;
    if (this.context) {
      if (this.titlePostfix) {
        return html`<h1 class="display-4">${this.context.name}${renderPostfix()}</h1>`;
      }
    }
    return undefined;
    function renderPostfix() {
      if (self.titlePostfix) {
        return html`<small class="text-muted"> - ${self.titlePostfix}</small>`;
      } else {
        return undefined;
      }
    }
  }

  public render() {
    if (this.context || this.errorMessage) {
      return html`<div class="container-fluid">
  <div class="row">
    <div class="col-md-12">
      ${this.renderReport()}
      ${this.renderErrorMessage()}
    </div>
  </div>
</div>`;
    } else {
      return html``;
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
    if (this.context && this.report && this.context.file) {
      return html`<mutation-test-report-file .model="${this.context.file}"></mutation-test-report-file>`;
    } else {
      return undefined;
    }
  }

  private renderTotals() {
    if (this.report && this.context) {
      return html`
    <div class='row'>
      <div class='totals col-sm-11'>
        <mutation-test-report-totals .currentPath="${this.path}" .thresholds="${this.report.thresholds}" .model="${this.context}">
        </mutation-test-report-totals>
      </div>
    </div>
    `;
    } else {
      return undefined;
    }
  }
}
