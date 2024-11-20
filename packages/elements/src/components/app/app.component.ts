/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import type { PropertyValues } from 'lit';
import { html, nothing, unsafeCSS, isServer } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type {
  FileUnderTestModel,
  Metrics,
  MetricsResult,
  MutantModel,
  MutationTestMetricsResult,
  TestFileModel,
  TestMetrics,
  TestModel,
} from 'mutation-testing-metrics';
import { calculateMutationTestMetrics } from 'mutation-testing-metrics';
import type { MutantResult, MutationTestResult } from 'mutation-testing-report-schema/api';
import type { Subscription } from 'rxjs';
import { fromEvent, sampleTime } from 'rxjs';
import { isLocalStorageAvailable } from '../../lib/browser.js';
import type { MteCustomEvent } from '../../lib/custom-events.js';
import { createCustomEvent } from '../../lib/custom-events.js';
import { toAbsoluteUrl } from '../../lib/html-helpers.js';
import { mutantChanges } from '../../lib/mutant-changes.js';
import { locationChange$, View } from '../../lib/router.js';
import type { Theme } from '../../lib/theme.js';
import { globals, tailwind } from '../../style/index.js';
import { RealTimeElement } from '../real-time-element.js';
import theme from './theme.scss?inline';
import { type MutationTestReportFilePickerComponent } from '../file-picker/file-picker.component.js';
import { createRef, ref } from 'lit/directives/ref.js';

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

/**
 * The report needs to be able to handle realtime updates, without any constraints.
 * To allow for this behaviour, we will update the `rootModel` once every 100ms.
 *
 * This throttling mechanism is only applied to the recalculation of the `rootModel`, since that is currently what takes
 * the most time.
 */
const UPDATE_CYCLE_TIME = 100;

type Context = MutantContext | TestContext;

@customElement('mutation-test-report-app')
export class MutationTestReportAppComponent extends RealTimeElement {
  @property({ attribute: false })
  public declare report: MutationTestResult | undefined;

  @property({ attribute: false })
  public declare rootModel: MutationTestMetricsResult | undefined;

  @property()
  public declare src: string | undefined;

  @property()
  public declare sse: string | undefined;

  @property({ attribute: false })
  public declare errorMessage: string | undefined;

  @property({ attribute: false })
  public declare context: Context;

  @property({ type: Array })
  public declare path: readonly string[];

  @property({ attribute: 'title-postfix' })
  public declare titlePostfix: string | undefined;

  @property({ reflect: true })
  public declare theme?: Theme;

  @property({ attribute: false })
  public get themeBackgroundColor(): string {
    return getComputedStyle(this).getPropertyValue('--mut-body-bg');
  }

  #filePickerRef = createRef<MutationTestReportFilePickerComponent>();

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

  constructor() {
    super();
    this.context = { view: View.mutant, path: [] };
    this.path = [];
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

  public willUpdate(changedProperties: PropertyValues<this>) {
    if (this.report) {
      // Set the theme when no theme is selected (light vs dark)
      if (!this.theme) {
        this.theme = this.getTheme();
      }
      if (changedProperties.has('report')) {
        this.updateModel(this.report);
      }
      if (changedProperties.has('path') || changedProperties.has('report')) {
        this.updateContext();
        this.updateTitle();
      }
    }
    if (changedProperties.has('src')) {
      void this.loadData();
    }
  }

  private mutants = new Map<string, MutantModel>();
  private tests = new Map<string, TestModel>();

  public updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('theme') && this.theme) {
      this.dispatchEvent(
        createCustomEvent('theme-changed', {
          theme: this.theme,
          themeBackgroundColor: this.themeBackgroundColor,
        }),
      );
    }
  }

  private getTheme(): Theme {
    // 1. check local storage
    const theme = isLocalStorageAvailable() && localStorage.getItem('mutation-testing-elements-theme');
    if (theme) {
      return theme as Theme;
      // 2. check for user's OS preference
    } else if (isServer || window.matchMedia?.('(prefers-color-scheme: dark)')?.matches) {
      return 'dark';
      // 3. default is light
    } else {
      return 'light';
    }
  }

  private updateModel(report: MutationTestResult) {
    this.rootModel = calculateMutationTestMetrics(report);
    collectForEach<FileUnderTestModel, Metrics>((file, metric) => {
      file.result = metric;
      file.mutants.forEach((mutant) => this.mutants.set(mutant.id, mutant));
    })(this.rootModel?.systemUnderTestMetrics);

    collectForEach<TestFileModel, TestMetrics>((file, metric) => {
      file.result = metric;
      file.tests.forEach((test) => this.tests.set(test.id, test));
    })(this.rootModel?.testMetrics);

    this.rootModel.systemUnderTestMetrics.updateParent();
    this.rootModel.testMetrics?.updateParent();

    function collectForEach<TFile, TMetrics>(collect: (file: TFile, metrics: MetricsResult<TFile, TMetrics>) => void) {
      return function forEachMetric(metrics: MetricsResult<TFile, TMetrics> | undefined): void {
        if (metrics?.file) {
          collect(metrics.file, metrics);
        }
        metrics?.childResults.forEach((child) => {
          forEachMetric(child);
        });
      };
    }
  }

  private updateContext() {
    if (this.rootModel) {
      const findResult = <TFile, TResult>(root: MetricsResult<TFile, TResult>, path: string[]): MetricsResult<TFile, TResult> | undefined => {
        return path.reduce<MetricsResult<TFile, TResult> | undefined>(
          (model, currentPathPart) => model?.childResults.find((child) => child.name === currentPathPart),
          root,
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
    if (isServer) return;
    else document.title = this.title;
  }

  public themeSwitch = (event: MteCustomEvent<'theme-switch'>) => {
    this.theme = event.detail;

    if (isLocalStorageAvailable()) {
      localStorage.setItem('mutation-testing-elements-theme', this.theme);
    }
  };

  public static styles = [globals, unsafeCSS(theme), tailwind];

  public readonly subscriptions: Subscription[] = [];

  public connectedCallback() {
    super.connectedCallback();
    this.subscriptions.push(locationChange$.subscribe((path) => (this.path = path)));
    this.initializeSse();
  }

  private source: EventSource | undefined;
  private sseSubscriptions = new Set<Subscription>();
  private theMutant?: MutantModel;
  private theTest?: TestModel;

  private initializeSse() {
    if (!this.sse) {
      return;
    }

    this.source = new EventSource(this.sse);

    const modifySubscription = fromEvent<MessageEvent>(this.source, 'mutant-tested').subscribe((event) => {
      const newMutantData = JSON.parse(event.data as string) as Partial<MutantResult> & Pick<MutantResult, 'id' | 'status'>;
      if (!this.report) {
        return;
      }

      const mutant = this.mutants.get(newMutantData.id);
      if (mutant === undefined) {
        return;
      }
      this.theMutant = mutant;

      for (const [prop, val] of Object.entries(newMutantData)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        (this.theMutant as any)[prop] = val;
      }

      if (newMutantData.killedBy) {
        newMutantData.killedBy.forEach((killedByTestId) => {
          const test = this.tests.get(killedByTestId)!;
          if (test === undefined) {
            return;
          }
          this.theTest = test;
          test.addKilled(this.theMutant!);
          this.theMutant!.addKilledBy(test);
        });
      }

      if (newMutantData.coveredBy) {
        newMutantData.coveredBy.forEach((coveredByTestId) => {
          const test = this.tests.get(coveredByTestId)!;
          if (test === undefined) {
            return;
          }
          this.theTest = test;
          test.addCovered(this.theMutant!);
          this.theMutant!.addCoveredBy(test);
        });
      }
    });

    const applySubscription = fromEvent(this.source, 'mutant-tested')
      .pipe(sampleTime(UPDATE_CYCLE_TIME))
      .subscribe(() => {
        this.applyChanges();
      });

    this.sseSubscriptions.add(modifySubscription);
    this.sseSubscriptions.add(applySubscription);

    this.source.addEventListener('finished', () => {
      this.source?.close();
      this.applyChanges();
      this.sseSubscriptions.forEach((s) => s.unsubscribe());
    });
  }

  private applyChanges() {
    this.theMutant?.update();
    this.theTest?.update();
    mutantChanges.next();
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
    if (this.context.result ?? this.errorMessage) {
      return html`
        <mte-file-picker ${ref(this.#filePickerRef)} .rootModel="${this.rootModel}"></mte-file-picker>
        <div class="container bg-white pb-4 font-sans text-gray-800 motion-safe:transition-max-width">
          <div class="space-y-4 transition-colors">
            ${this.renderErrorMessage()}
            <mte-theme-switch @theme-switch="${this.themeSwitch}" class="sticky top-offset z-20 float-right pt-6" .theme="${this.theme}">
            </mte-theme-switch>
            ${this.renderTitle()} ${this.renderTabs()}
            <mte-breadcrumb
              @mte-file-picker-open="${() => this.#filePickerRef.value?.open()}"
              .view="${this.context.view}"
              .path="${this.context.path}"
            ></mte-breadcrumb>
            <mte-result-status-bar
              .detected="${this.rootModel?.systemUnderTestMetrics.metrics.totalDetected}"
              .noCoverage="${this.rootModel?.systemUnderTestMetrics.metrics.noCoverage}"
              .pending="${this.rootModel?.systemUnderTestMetrics.metrics.pending}"
              .survived="${this.rootModel?.systemUnderTestMetrics.metrics.survived}"
              .total="${this.rootModel?.systemUnderTestMetrics.metrics.totalValid}"
            ></mte-result-status-bar>
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
        <nav class="border-b border-gray-200 text-center text-sm font-medium text-gray-600">
          <ul class="-mb-px flex flex-wrap" role="tablist">
            ${[
              { type: 'mutant', isActive: mutantsActive, text: '👽 Mutants' },
              { type: 'test', isActive: testsActive, text: '🧪 Tests' },
            ].map(
              ({ type, isActive, text }) =>
                html`<li class="mr-2" role="presentation">
                  <a
                    class="inline-block rounded-t-lg border-b-2 border-transparent p-4 transition-colors hover:border-gray-300 hover:bg-gray-200 hover:text-gray-700 aria-selected:border-b-[3px] aria-selected:border-primary-700 aria-selected:text-primary-on"
                    role="tab"
                    href="${toAbsoluteUrl(type)}"
                    aria-selected="${isActive}"
                    aria-controls="mte-${type}-view"
                    >${text}</a
                  >
                </li>`,
            )}
          </ul>
        </nav>
      `;
    } else {
      return nothing;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mutation-test-report-app': MutationTestReportAppComponent;
  }
}
