import { LitElement, html, property, customElement, PropertyValues, unsafeCSS } from 'lit-element';
import { MutantResult, MutationTestResult } from 'mutation-testing-report-schema';
import { MetricsResult, calculateMutationTestMetrics } from 'mutation-testing-metrics';
import { bootstrap } from '../../style';
import { locationChange$ } from '../../lib/router';
import { Subscription } from 'rxjs';
import style from './mutation-test-report-app.scss';
import theme from './theme.scss';
import { createCustomEvent, MteCustomEvent } from '../../lib/custom-events';
import { FileUnderTestModel, Metrics, MutationTestMetricsResult } from 'mutation-testing-metrics/src/model';
import { DrawerMode } from '../mutation-test-report-drawer/mutation-test-report-drawer.component';

@customElement('mutation-test-report-app')
export class MutationTestReportAppComponent extends LitElement {
  @property({ attribute: false })
  public report: MutationTestResult | undefined;

  @property({ attribute: false })
  public rootModel: MutationTestMetricsResult | undefined;

  @property()
  public src: string | undefined;

  @property({ attribute: false })
  public errorMessage: string | undefined;

  @property({ attribute: false })
  public context: MetricsResult<FileUnderTestModel, Metrics> | undefined;

  @property()
  public path: ReadonlyArray<string> = [];

  @property({ attribute: 'title-postfix' })
  public titlePostfix: string | undefined;

  @property({ reflect: true })
  public theme: string | undefined;

  @property()
  public drawerMode: DrawerMode = 'closed';

  @property({ attribute: false })
  public get themeBackgroundColor(): string {
    return getComputedStyle(this).getPropertyValue('--bs-body-bg');
  }

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

  @property()
  private selectedMutant?: MutantResult;

  public firstUpdated(): void {
    if (!this.theme) {
      // 1. check local storage
      const theme = localStorage.getItem('mutation-testing-elements-theme');
      if (theme) {
        this.theme = theme;
        // 2. check for user's OS preference
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')?.matches) {
        this.theme = 'dark';
        // 3. default is light
      } else {
        this.theme = 'light';
      }
    }
  }

  private async loadData() {
    if (this.src) {
      try {
        const res = await fetch(this.src);
        this.report = await res.json();
      } catch (error) {
        const e = String(error);
        this.errorMessage = e;
      }
    }
  }

  public async updated(changedProperties: PropertyValues) {
    if ((changedProperties.has('path') || changedProperties.has('report')) && this.report) {
      this.updateModel(this.report);
      this.updateContext();
      this.updateTitle();
    }
    if (changedProperties.has('src')) {
      await this.loadData();
    }
    if (changedProperties.has('theme') && this.theme) {
      this.dispatchEvent(createCustomEvent('theme-changed', { theme: this.theme, themeBackgroundColor: this.themeBackgroundColor }));
    }
  }

  private updateModel(report: MutationTestResult) {
    this.rootModel = calculateMutationTestMetrics(report);
  }

  private updateContext() {
    if (this.rootModel) {
      // Find the current selected file/directory based on the path
      this.context = this.path.reduce<MetricsResult | undefined>(
        (model, currentPathPart) => model && model.childResults.find((child) => child.name === currentPathPart),
        this.rootModel.systemUnderTestMetrics
      );
    }
  }

  private updateTitle() {
    document.title = this.title;
  }

  public themeSwitch = (event: CustomEvent<string>) => {
    this.theme = event.detail;

    localStorage.setItem('mutation-testing-elements-theme', this.theme);
  };

  public static styles = [unsafeCSS(theme), bootstrap, unsafeCSS(style)];

  public readonly subscriptions: Subscription[] = [];
  public connectedCallback() {
    super.connectedCallback();
    this.subscriptions.push(locationChange$.subscribe((path) => (this.path = path)));
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private renderTitle() {
    if (this.context && this.titlePostfix) {
      return html`<h1 class="display-4">${this.context.name}${html`<small class="text-muted"> - ${this.titlePostfix}</small>`}</h1>`;
    }
    return undefined;
  }

  private handleClick = () => {
    // Close the drawer if the user clicks anywhere in the report (that didn't handle the click already)
    this.drawerMode = 'closed';
  };

  public render() {
    if (this.context || this.errorMessage) {
      return html`
        <div class="container-fluid" @click="${this.handleClick}">
          <div class="row">
            <div class="col-md-12">
              <main>${this.renderMain()} ${this.renderErrorMessage()}</main>
              <mutation-test-report-drawer-mutant .mode="${this.drawerMode}" .tests="${this.report?.testFiles}" .mutant="${this.selectedMutant}">
              </mutation-test-report-drawer-mutant>
            </div>
          </div>
        </div>
      `;
    } else {
      return html``;
    }
  }

  private renderErrorMessage() {
    if (this.errorMessage) {
      return html`<div class="alert alert-danger" role="alert">${this.errorMessage}</div>`;
    } else {
      return html``;
    }
  }

  private renderMain() {
    if (this.context) {
      return html`
        <mutation-test-report-theme-switch @theme-switch="${this.themeSwitch}" class="theme-switch" .theme="${this.theme}">
        </mutation-test-report-theme-switch>
        ${this.renderTitle()}
        <mutation-test-report-breadcrumb .path="${this.path}"></mutation-test-report-breadcrumb>
        ${this.renderTotals()} ${this.renderFileReport()}
      `;
    } else {
      return undefined;
    }
  }

  private handleMutantSelected = (event: MteCustomEvent<'mutant-selected'>) => {
    this.selectedMutant = event.detail.mutant;
    this.drawerMode = event.detail.selected ? 'half' : 'closed';
  };

  private renderFileReport() {
    if (this.context && this.report && this.context.file) {
      return html`<mutation-test-report-file @mutant-selected="${this.handleMutantSelected}" .model="${this.context.file}">
      </mutation-test-report-file>`;
    } else {
      return undefined;
    }
  }

  private renderTotals() {
    if (this.report && this.context) {
      return html`
        <div class="row">
          <div class="totals col-sm-11">
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
