import { LitElement, html, PropertyValues, unsafeCSS, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MutationTestResult } from 'mutation-testing-report-schema/api';
import { MetricsResult, calculateMutationTestMetrics, MutantModel } from 'mutation-testing-metrics';
import { tailwind, globals } from '../../style';
import { locationChange$, View } from '../../lib/router';
import { Subscription } from 'rxjs';
import theme from './theme.scss';
import { createCustomEvent } from '../../lib/custom-events';
import { FileUnderTestModel, Metrics, MutationTestMetricsResult, TestFileModel, TestMetrics } from 'mutation-testing-metrics';
import { toAbsoluteUrl } from '../../lib/html-helpers';
import { isLocalStorageAvailable } from '../../lib/browser';
import { MutantStatus } from 'mutation-testing-report-schema';

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

  @property()
  public sse: string | undefined;

  @property({ attribute: false })
  public errorMessage: string | undefined;

  @property({ attribute: false })
  public context: Context = { view: View.mutant, path: [] };

  @property()
  public path: ReadonlyArray<string> = [];

  @property({ attribute: 'title-postfix' })
  public titlePostfix: string | undefined;

  @property({ reflect: true })
  public theme?: string;

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
      this.dispatchEvent(
        createCustomEvent('theme-changed', {
          theme: this.theme,
          themeBackgroundColor: this.themeBackgroundColor,
        })
      );
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

  public static styles = [globals, unsafeCSS(theme), tailwind];

  public readonly subscriptions: Subscription[] = [];

  public connectedCallback() {
    super.connectedCallback();
    this.subscriptions.push(locationChange$.subscribe((path) => (this.path = path)));
    this.initializeSSE();
  }

  private source: EventSource | undefined;

  private initializeSSE() {
    if (!this.sse) {
      return;
    }

    this.source = new EventSource(this.sse);
    this.source.addEventListener("mutation", event => {
      const newMutantData = JSON.parse(event.data) as Partial<MutantModel> & { id: string, status: MutantStatus };

      if (!this.report) {
        return;
      }

      const theMutant = Object.values(this.report.files)
        .flatMap(file => file.mutants)
        .find(mutant => mutant.id === newMutantData.id);

      if (theMutant === undefined) {
        return;
      }

      theMutant.status = newMutantData.status;
      // It is only required to set the mutant status, but we accept new changes to the mutant regardless:
      theMutant.description ??= newMutantData.description;
      theMutant.coveredBy ??= newMutantData.coveredBy;
      theMutant.duration ??= newMutantData.duration;
      theMutant.killedBy ??= newMutantData.killedBy;
      theMutant.replacement ??= newMutantData.replacement;
      theMutant.static ??= newMutantData.static;
      theMutant.statusReason ??= newMutantData.statusReason;
      theMutant.testsCompleted ??= newMutantData.testsCompleted;
      theMutant.location = newMutantData.location ?? theMutant.location;
      theMutant.mutatorName = newMutantData.mutatorName ?? theMutant.mutatorName;

      this.scheduleRender();
    });
    this.source.addEventListener("finished", () => {
      this.source?.close();
      this.scheduleRender();
    });
  }

  private renderScheduled = false;

  private scheduleRender() {
    if (this.renderScheduled) {
      return;
    }

    this.renderScheduled = true;
    setTimeout(() => {
      if (!this.report) {
        return;
      }

      this.updateModel(this.report);
      this.updateContext();
      this.renderScheduled = false;
    }, 150);
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private renderTitle() {
    if (this.context.result) {
      return html`
        <h1 class="text-5xl font-bold tracking-tight">
          ${this.context.result.name}${this.titlePostfix
            ? html`<small class="text-light-muted ml-4 font-light">${this.titlePostfix}</small>`
            : nothing}
        </h1>
      `;
    }
    return nothing;
  }

  public render() {
    if (this.context.result || this.errorMessage) {
      return html`
        <div class="container bg-white pb-4 font-sans text-gray-800 motion-safe:transition-max-width">
          <div class="space-y-4 transition-colors">
            ${this.renderErrorMessage()}
            <mte-theme-switch @theme-switch="${this.themeSwitch}" class="sticky top-offset z-20 float-right mx-4 pt-4" .theme="${this.theme}">
            </mte-theme-switch>
            ${this.renderTitle()} ${this.renderTabs()}
            <mte-breadcrumb .view="${this.context.view}" class="my-4" .path="${this.context.path}"></mte-breadcrumb>
            ${this.context.view === 'mutant' && this.context.result
              ? html`<mte-mutant-view
                  id="mte-mutant-view"
                  .result="${this.context.result}"
                  .thresholds="${this.report!.thresholds}"
                  .path="${this.path}"
                ></mte-mutant-view>`
              : nothing}
            ${this.context.view === 'test' && this.context.result
              ? html`<mte-test-view id="mte-test-view" .result="${this.context.result}" .path="${this.path}"></mte-test-view>`
              : nothing}
          </div>
        </div>
      `;
    } else {
      return html``;
    }
  }

  private renderErrorMessage() {
    if (this.errorMessage) {
      return html`<div class="my-4 rounded-lg bg-red-100 p-4 text-sm text-red-700" role="alert">${this.errorMessage}</div>`;
    } else {
      return nothing;
    }
  }

  private renderTabs() {
    if (this.rootModel?.testMetrics) {
      const mutantsActive = this.context.view === 'mutant';
      const testsActive = this.context.view === 'test';

      return html`
        <nav class="border-b border-gray-200 text-center text-sm font-medium  text-gray-600">
          <ul class="-mb-px flex flex-wrap" role="tablist">
            ${[
              { type: 'mutant', isActive: mutantsActive, text: '👽 Mutants' },
              { type: 'test', isActive: testsActive, text: '🧪 Tests' },
            ].map(
              ({ type, isActive, text }) => html`<li class="mr-2" role="presentation">
                <a
                  class="inline-block rounded-t-lg border-b-2 border-transparent p-4 transition-colors hover:border-gray-300 hover:bg-gray-200 hover:text-gray-700 aria-selected:border-b-[3px] aria-selected:border-primary-700  aria-selected:text-primary-on"
                  role="tab"
                  href="${toAbsoluteUrl(type)}"
                  aria-selected="${isActive}"
                  aria-controls="mte-${type}-view"
                  >${text}</a
                >
              </li>`
            )}
          </ul>
        </nav>
      `;
    } else {
      return nothing;
    }
  }
}
