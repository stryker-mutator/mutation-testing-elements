import { LitElement, html, property, customElement, PropertyValues, unsafeCSS } from 'lit-element';
import { MutationTestResult } from 'mutation-testing-report-schema/api';
import { MetricsResult, calculateMutationTestMetrics } from 'mutation-testing-metrics';
import { bootstrap, globals } from '../../style';
import { locationChange$, View } from '../../lib/router';
import { Subscription } from 'rxjs';
import style from './app.scss';
import theme from './theme.scss';
import { createCustomEvent } from '../../lib/custom-events';
import { FileUnderTestModel, Metrics, MutationTestMetricsResult, TestFileModel, TestMetrics } from 'mutation-testing-metrics/src/model';
import { toAbsoluteUrl } from '../../lib/htmlHelpers';
import { isLocalStorageAvailable } from '../../lib/browser';

interface BaseContext {
  path: string[];
}

interface MutantContext extends BaseContext {
  view: View.mutant;
  result?: MetricsResult<FileUnderTestModel, Metrics>;
}

interface TestContext extends BaseContext {
  view: View.test;
  result?: MetricsResult<TestFileModel, TestMetrics>;
}

type Context = MutantContext | TestContext;

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
  public context: Context = { view: View.mutant, path: [] };

  @property()
  public path: ReadonlyArray<string> = [];

  @property({ attribute: 'title-postfix' })
  public titlePostfix: string | undefined;

  @property({ reflect: true })
  public theme: string | undefined;

  @property({ attribute: false })
  public get themeBackgroundColor(): string {
    return getComputedStyle(this).getPropertyValue('--bs-body-bg');
  }

  @property()
  public get title(): string {
    if (this.context.result) {
      if (this.titlePostfix) {
        return `${this.context.result.name} - ${this.titlePostfix}`;
      } else {
        return this.context.result.name;
      }
    } else {
      return '';
    }
  }

  public firstUpdated(): void {
    // Set the theme when no theme is selected (light vs dark)
    if (!this.theme) {
      // 1. check local storage
      const theme = isLocalStorageAvailable() && localStorage.getItem('mutation-testing-elements-theme');
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

    // Set the default view to "mutant" when no route is selected
    if (this.path.length === 0 || (this.path[0] !== View.mutant && this.path[0] !== View.test)) {
      window.location.replace(toAbsoluteUrl(`${View.mutant}`));
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
      const findResult = <TFile, TResult>(root: MetricsResult<TFile, TResult>, path: string[]): MetricsResult<TFile, TResult> | undefined => {
        return path.reduce<MetricsResult<TFile, TResult> | undefined>(
          (model, currentPathPart) => model && model.childResults.find((child) => child.name === currentPathPart),
          root
        );
      };
      const path = this.path.slice(1);
      if (this.path[0] === (View.test as string) && this.rootModel.testMetrics) {
        this.context = {
          view: View.test,
          path,
          result: findResult(this.rootModel.testMetrics, this.path.slice(1)),
        };
      } else {
        this.context = {
          view: View.mutant,
          path,
          result: findResult(this.rootModel.systemUnderTestMetrics, this.path.slice(1)),
        };
      }
    }
  }

  private updateTitle() {
    document.title = this.title;
  }

  public themeSwitch = (event: CustomEvent<string>) => {
    this.theme = event.detail;

    isLocalStorageAvailable() && localStorage.setItem('mutation-testing-elements-theme', this.theme);
  };

  public static styles = [globals, unsafeCSS(theme), bootstrap, unsafeCSS(style)];

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
    if (this.context.result) {
      return html`<h1 class="display-4"
        >${this.context.result.name}${this.titlePostfix ? html`<small class="text-muted"> - ${this.titlePostfix}</small>` : ''}</h1
      >`;
    }
    return undefined;
  }

  public render() {
    if (this.context.result || this.errorMessage) {
      return html`
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-12">
              ${this.renderErrorMessage()}
              <mte-theme-switch @theme-switch="${this.themeSwitch}" class="theme-switch" .theme="${this.theme}"> </mte-theme-switch>
              ${this.renderTitle()} ${this.renderTabs()}
              <mte-breadcrumb .view="${this.context.view}" .path="${this.context.path}"></mte-breadcrumb>
              ${this.context.view === 'mutant' && this.context.result
                ? html`<mte-mutant-view
                    .result="${this.context.result}"
                    .thresholds="${this.report!.thresholds}"
                    .path="${this.path}"
                  ></mte-mutant-view>`
                : ''}
              ${this.context.view === 'test' && this.context.result
                ? html`<mte-test-view .result="${this.context.result}" .path="${this.path}"></mte-test-view>`
                : ''}
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

  private renderTabs() {
    if (this.rootModel?.testMetrics) {
      return html`<nav>
        <ul class="nav nav-tabs border-bottom-0" role="tablist">
          <li class="nav-item">
            <a class="nav-link ${this.context.view === 'mutant' ? 'active' : ''}" role="tab" href="${toAbsoluteUrl('mutant')}">👽 Mutants</a>
          </li>
          <li class="nav-item">
            <a class="nav-link ${this.context.view === 'test' ? 'active' : ''}" role="tab" href="${toAbsoluteUrl('test')}">🧪 Tests</a>
          </li>
        </ul>
      </nav>`;
    } else {
      return undefined;
    }
  }
}
