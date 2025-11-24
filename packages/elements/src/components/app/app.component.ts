import type { PropertyValues } from 'lit';
import { html, isServer, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { when } from 'lit/directives/when.js';
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
import { tailwind } from '../../style/index.js';
import { type MutationTestReportFilePickerComponent } from '../file-picker/file-picker.component.js';
import { RealTimeElement } from '../real-time-element.js';
import theme from './theme.css?inline';

interface BaseContext {
  view: View;
  path: string[];
}

interface MutantContext extends BaseContext {
  view: 'mutant';
  result?: MetricsResult<FileUnderTestModel, Metrics>;
}

interface TestContext extends BaseContext {
  view: 'test';
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
  declare public report: MutationTestResult | undefined;

  @property({ attribute: false })
  declare public rootModel: MutationTestMetricsResult | undefined;

  @property()
  declare public src: string | undefined;

  @property()
  declare public sse: string | undefined;

  @property({ attribute: false })
  declare public errorMessage: string | undefined;

  @property({ attribute: false })
  declare public context: Context;

  @property({ type: Array })
  declare public path: readonly string[];

  @property({ attribute: 'title-postfix' })
  declare public titlePostfix: string | undefined;

  @property({ reflect: true })
  declare public theme?: Theme;

  @property({ attribute: false })
  public get themeBackgroundColor(): string {
    return getComputedStyle(this).getPropertyValue('--color-white');
  }

  @query('mte-file-picker')
  declare private filePicker: MutationTestReportFilePickerComponent;

  #abortController = new AbortController();

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

  async #loadData() {
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
      this.theme ??= this.#getTheme();
      if (changedProperties.has('report')) {
        this.#updateModel(this.report);
      }
      if (changedProperties.has('path') || changedProperties.has('report')) {
        this.#updateContext();
        this.#updateTitle();
      }
    }
    if (changedProperties.has('src')) {
      void this.#loadData();
    }
  }

  #mutants = new Map<string, MutantModel>();
  #tests = new Map<string, TestModel>();

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

  #handlePrefersColorScheme = () => {
    this.theme = this.#getTheme();
  };

  #getTheme(): Theme {
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

  #updateModel(report: MutationTestResult) {
    this.rootModel = calculateMutationTestMetrics(report);
    collectForEach<FileUnderTestModel, Metrics>((file, metric) => {
      file.result = metric;
      file.mutants.forEach((mutant) => this.#mutants.set(mutant.id, mutant));
    })(this.rootModel?.systemUnderTestMetrics);

    collectForEach<TestFileModel, TestMetrics>((file, metric) => {
      file.result = metric;
      file.tests.forEach((test) => this.#tests.set(test.id, test));
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

  #updateContext() {
    if (this.rootModel) {
      const findResult = <TFile, TResult>(root: MetricsResult<TFile, TResult>, path: string[]): MetricsResult<TFile, TResult> | undefined => {
        return path.reduce<MetricsResult<TFile, TResult> | undefined>(
          (model, currentPathPart) => model?.childResults.find((child) => child.name === currentPathPart),
          root,
        );
      };
      const path = this.path.slice(1);
      if (this.path[0] === View.test && this.rootModel.testMetrics) {
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

  #updateTitle() {
    if (isServer) return;
    else document.title = this.title;
  }

  public themeSwitch = (event: MteCustomEvent<'theme-switch'>) => {
    this.theme = event.detail;

    if (isLocalStorageAvailable()) {
      localStorage.setItem('mutation-testing-elements-theme', this.theme);
    }
  };

  public static styles = [unsafeCSS(theme), tailwind];

  public readonly subscriptions: Subscription[] = [];

  public connectedCallback() {
    super.connectedCallback();
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener?.('change', this.#handlePrefersColorScheme, { signal: this.#abortController.signal });
    this.subscriptions.push(locationChange$.subscribe((path) => (this.path = path)));
    this.#initializeSse();
  }

  #source: EventSource | undefined;
  #sseSubscriptions = new Set<Subscription>();
  #theMutant?: MutantModel;
  #theTest?: TestModel;

  #initializeSse() {
    if (!this.sse) {
      return;
    }

    this.#source = new EventSource(this.sse);

    const modifySubscription = fromEvent<MessageEvent>(this.#source, 'mutant-tested').subscribe((event) => {
      const newMutantData = JSON.parse(event.data as string) as Partial<MutantResult> & Pick<MutantResult, 'id' | 'status'>;
      if (!this.report) {
        return;
      }

      const mutant = this.#mutants.get(newMutantData.id);
      if (mutant === undefined) {
        return;
      }
      this.#theMutant = mutant;

      for (const [prop, val] of Object.entries(newMutantData)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        (this.#theMutant as any)[prop] = val;
      }

      if (newMutantData.killedBy) {
        newMutantData.killedBy.forEach((killedByTestId) => {
          const test = this.#tests.get(killedByTestId)!;
          if (test === undefined) {
            return;
          }
          this.#theTest = test;
          test.addKilled(this.#theMutant!);
          this.#theMutant!.addKilledBy(test);
        });
      }

      if (newMutantData.coveredBy) {
        newMutantData.coveredBy.forEach((coveredByTestId) => {
          const test = this.#tests.get(coveredByTestId)!;
          if (test === undefined) {
            return;
          }
          this.#theTest = test;
          test.addCovered(this.#theMutant!);
          this.#theMutant!.addCoveredBy(test);
        });
      }
    });

    const applySubscription = fromEvent(this.#source, 'mutant-tested')
      .pipe(sampleTime(UPDATE_CYCLE_TIME))
      .subscribe(() => {
        this.#applyChanges();
      });

    this.#sseSubscriptions.add(modifySubscription);
    this.#sseSubscriptions.add(applySubscription);

    this.#source.addEventListener('finished', () => {
      this.#source?.close();
      this.#applyChanges();
      this.#sseSubscriptions.forEach((s) => s.unsubscribe());
    });
  }

  #applyChanges() {
    this.#theMutant?.update();
    this.#theTest?.update();
    mutantChanges.next();
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this.#abortController.abort();
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  #renderTitle() {
    return when(
      this.context.result,
      (result) =>
        html`<h1 class="mt-4 text-5xl font-bold tracking-tight">
          ${result.name}${when(this.titlePostfix, (postfix) => html`<small class="text-light-muted ml-4 font-light">${postfix}</small>`)}
        </h1>`,
    );
  }

  public render() {
    return when(
      this.context.result ?? this.errorMessage,
      () =>
        html`<mte-file-picker .rootModel="${this.rootModel}"></mte-file-picker>
          <div class="container space-y-4 bg-white pb-4 font-sans text-gray-800 transition-colors motion-safe:transition-max-width">
            ${this.#renderErrorMessage()}
            <mte-theme-switch @theme-switch="${this.themeSwitch}" class="sticky top-offset z-20 float-right mb-0 pt-7" .theme="${this.theme}">
            </mte-theme-switch>
            ${this.#renderTitle()} ${this.#renderTabs()}
            <mte-breadcrumb
              @mte-file-picker-open="${() => this.filePicker.open()}"
              .view="${this.context.view}"
              .path="${this.context.path}"
            ></mte-breadcrumb>
            <mte-result-status-bar
              detected="${ifDefined(this.rootModel?.systemUnderTestMetrics.metrics.totalDetected)}"
              no-coverage="${ifDefined(this.rootModel?.systemUnderTestMetrics.metrics.noCoverage)}"
              pending="${ifDefined(this.rootModel?.systemUnderTestMetrics.metrics.pending)}"
              survived="${ifDefined(this.rootModel?.systemUnderTestMetrics.metrics.survived)}"
              total="${ifDefined(this.rootModel?.systemUnderTestMetrics.metrics.totalValid)}"
            ></mte-result-status-bar>
            ${when(
              this.context.view === 'mutant' && this.context.result,
              () =>
                html`<mte-mutant-view
                  id="mte-mutant-view"
                  .result="${this.context.result}"
                  .thresholds="${this.report!.thresholds}"
                  .path="${this.path}"
                ></mte-mutant-view>`,
            )}
            ${when(
              this.context.view === 'test' && this.context.result,
              () => html`<mte-test-view id="mte-test-view" .result="${this.context.result}" .path="${this.path}"></mte-test-view>`,
            )}
          </div>`,
    );
  }

  #renderErrorMessage() {
    return when(
      this.errorMessage,
      (errorMessage) => html`<div class="my-4 rounded-lg bg-red-100 p-4 text-sm text-red-700" role="alert">${errorMessage}</div>`,
    );
  }

  #renderTabs() {
    return when(this.rootModel?.testMetrics, () => {
      const mutantsActive = this.context.view === 'mutant';
      const testsActive = this.context.view === 'test';

      return html`<nav class="border-b border-gray-200 text-center text-sm font-medium text-gray-600">
        <ul class="-mb-px flex flex-wrap" role="tablist">
          ${[
            { type: 'mutant', isActive: mutantsActive, text: '👽 Mutants' },
            { type: 'test', isActive: testsActive, text: '🧪 Tests' },
          ].map(
            ({ type, isActive, text }) =>
              html`<li class="mr-2" role="presentation">
                <a
                  class="inline-block rounded-t-lg border-b-2 border-transparent p-4 transition-colors hover:border-gray-300 hover:bg-gray-200 hover:text-gray-700 aria-selected:border-b-[3px] aria-selected:border-solid aria-selected:border-primary-700 aria-selected:text-primary-on"
                  role="tab"
                  href="${toAbsoluteUrl(type)}"
                  aria-selected="${isActive}"
                  aria-controls="mte-${type}-view"
                  >${text}</a
                >
              </li>`,
          )}
        </ul>
      </nav>`;
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mutation-test-report-app': MutationTestReportAppComponent;
  }
}
