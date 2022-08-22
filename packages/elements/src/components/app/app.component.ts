import { LitElement, html, PropertyValues, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MutationTestResult } from 'mutation-testing-report-schema/api';
import { MetricsResult, calculateMutationTestMetrics } from 'mutation-testing-metrics';
import { tailwind, globals } from '../../style';
import { locationChange$, View } from '../../lib/router';
import { Subscription } from 'rxjs';
import style from './app.css';
import theme from './theme.scss';
import { createCustomEvent } from '../../lib/custom-events';
import { FileUnderTestModel, Metrics, MutationTestMetricsResult, TestFileModel, TestMetrics } from 'mutation-testing-metrics';
import { toAbsoluteUrl } from '../../lib/html-helpers';
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
    return getComputedStyle(this).getPropertyValue('--mut-body-bg');
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

  public async willUpdate(changedProperties: PropertyValues) {
    // Set the theme when no theme is selected (light vs dark)
    if (!this.theme) {
      this.theme = this.getTheme();
    }

    if (this.report) {
      if (changedProperties.has('report')) {
        this.updateModel(this.report);
      }
      if (changedProperties.has('path') || changedProperties.has('report')) {
        this.updateContext();
        this.updateTitle();
      }
    }
    if (changedProperties.has('src')) {
      await this.loadData();
    }
  }

  public updated(changedProperties: PropertyValues) {
    if (changedProperties.has('theme') && this.theme) {
      this.dispatchEvent(createCustomEvent('theme-changed', { theme: this.theme, themeBackgroundColor: this.themeBackgroundColor }));
    }
  }

  private getTheme(): string {
    // 1. check local storage
    const theme = isLocalStorageAvailable() && localStorage.getItem('mutation-testing-elements-theme');
    if (theme) {
      return theme;
      // 2. check for user's OS preference
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')?.matches) {
      return 'dark';
      // 3. default is light
    } else {
      return 'light';
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

  public static styles = [globals, unsafeCSS(theme), tailwind, unsafeCSS(style)];

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
      return html`
        <h1 class="text-5xl font-bold tracking-tight mb-5 mt-4"
          >${this.context.result.name}${this.titlePostfix
            ? html`<small class="ml-4 font-light text-light-muted dark:text-dark-muted">${this.titlePostfix}</small>`
            : ''}
        </h1>
      `;
    }
    return undefined;
  }

  public render() {
    if (this.context.result || this.errorMessage) {
      return html`
        <div class="mx-auto px-4 bg-bodyz text-gray-800 dark:text-gray-200 font-sans">
          <div class="transition-colors">
            ${this.renderErrorMessage()}
            <mte-theme-switch @theme-switch="${this.themeSwitch}" class="float-right sticky pt-4 mx-4 z-20 theme-switch" .theme="${this.theme}">
            </mte-theme-switch>
            ${this.renderTitle()} ${this.renderTabs()}
            <!-- TODO: solution for putting theme="\${this.theme}" on everything -->
            <mte-breadcrumb .view="${this.context.view}" .path="${this.context.path}"></mte-breadcrumb>
            ${this.context.view === 'mutant' && this.context.result
              ? html`<mte-mutant-view
                  id="mte-mutant-view"
                  theme="${this.theme}"
                  .result="${this.context.result}"
                  .thresholds="${this.report!.thresholds}"
                  .path="${this.path}"
                ></mte-mutant-view>`
              : ''}
            ${this.context.view === 'test' && this.context.result
              ? html`<mte-test-view id="mte-test-view" .result="${this.context.result}" .path="${this.path}" theme="${this.theme}"></mte-test-view>`
              : ''}
          </div>
        </div>
      `;
    } else {
      return html``;
    }
  }

  private renderErrorMessage() {
    if (this.errorMessage) {
      return html`<div class="p-4 my-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
        ${this.errorMessage}
      </div>`;
    } else {
      return html``;
    }
  }

  private renderTabs() {
    if (this.rootModel?.testMetrics) {
      const mutantsActive = this.context.view === 'mutant';
      const testsActive = this.context.view === 'test';

      return html`
        <nav class="text-sm font-medium text-center mb-6 text-gray-500 border-b border-gray-200 dark:border-gray-700">
          <ul class="flex flex-wrap -mb-px" role="tablist">
            ${[
              { type: 'mutant', active: mutantsActive, text: '👽 Mutants' },
              { type: 'test', active: testsActive, text: '🧪 Tests' },
            ].map(
              ({ type, active, text }) => html`<li class="mr-2" role="presentation">
                <a
                  class="inline-block p-4 rounded-t-lg border-b-2 border-transparent  ${active
                    ? 'text-blue-600 border-blue-600 active dark:text-blue-500 dark:border-blue-500'
                    : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}"
                  role="tab"
                  href="${toAbsoluteUrl(type)}"
                  aria-selected="${mutantsActive}"
                  aria-controls="mte-${type}-view"
                  >${text}</a
                >
              </li>`
            )}
          </ul>
        </nav>
      `;
    } else {
      return undefined;
    }
  }
}
