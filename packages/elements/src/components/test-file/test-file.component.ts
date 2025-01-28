import '../../style/prism-plugins.js';

import type { PropertyValues } from 'lit';
import { html, nothing, svg, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { repeat } from 'lit/directives/repeat.js';
import type { TestFileModel, TestModel } from 'mutation-testing-metrics';
import { TestStatus } from 'mutation-testing-metrics';

import { determineLanguage, gte, highlightCode, transformHighlightedLines } from '../../lib/code-helpers.js';
import type { MteCustomEvent } from '../../lib/custom-events.js';
import { createCustomEvent } from '../../lib/custom-events.js';
import { getContextClassForTestStatus, getEmojiForTestStatus, scrollToCodeFragmentIfNeeded } from '../../lib/html-helpers.js';
import { prismjs, tailwind } from '../../style/index.js';
import { beginElementAnimation, circle, renderDots, renderLine, triangle } from '../file/util.js';
import { RealTimeElement } from '../real-time-element.js';
import type { StateFilter } from '../state-filter/state-filter.component.js';
import style from './test-file.scss?inline';

@customElement('mte-test-file')
export class TestFileComponent extends RealTimeElement {
  public static styles = [prismjs, tailwind, unsafeCSS(style)];

  @property({ attribute: false })
  declare public model: TestFileModel | undefined;

  @state()
  declare private filters: StateFilter<TestStatus>[];

  @state()
  declare private lines: string[];

  @state()
  declare public enabledStates: TestStatus[];

  @state()
  declare private selectedTest: TestModel | undefined;

  @state()
  declare private tests: TestModel[];

  #abortController: AbortController;

  constructor() {
    super();
    this.filters = [];
    this.lines = [];
    this.enabledStates = [];
    this.tests = [];
    this.#abortController = new AbortController();
  }

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('keydown', this.#handleKeyDown, { signal: this.#abortController.signal });
  }

  disconnectedCallback(): void {
    this.#abortController.abort();
    super.disconnectedCallback();
  }

  #handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.#deselectTest();
    }
  };

  private readonly filtersChanged = (event: MteCustomEvent<'filters-changed'>) => {
    this.enabledStates = event.detail as TestStatus[];
    if (this.selectedTest && !this.enabledStates.includes(this.selectedTest.status)) {
      this.toggleTest(this.selectedTest);
    }
  };

  private toggleTest(test: TestModel) {
    this.#animateTestToggle(test);
    if (this.selectedTest === test) {
      this.selectedTest = undefined;
      this.dispatchEvent(createCustomEvent('test-selected', { selected: false, test }));
    } else {
      if (this.selectedTest) {
        this.#animateTestToggle(this.selectedTest);
      }
      this.selectedTest = test;
      this.dispatchEvent(createCustomEvent('test-selected', { selected: true, test }));
      scrollToCodeFragmentIfNeeded(this.renderRoot.querySelector(`[test-id="${test.id}"]`));
    }
  }

  private readonly nextTest = () => {
    const index = this.selectedTest ? (this.tests.findIndex(({ id }) => id === this.selectedTest!.id) + 1) % this.tests.length : 0;
    this.selectTest(this.tests[index]);
  };
  private readonly previousTest = () => {
    const index = this.selectedTest
      ? (this.tests.findIndex(({ id }) => id === this.selectedTest!.id) + this.tests.length - 1) % this.tests.length
      : this.tests.length - 1;
    this.selectTest(this.tests[index]);
  };

  private selectTest(test: TestModel | undefined) {
    if (test) {
      this.toggleTest(test);
    }
  }

  public render() {
    return html`
      <mte-state-filter
        @next=${this.nextTest}
        @previous=${this.previousTest}
        .filters="${this.filters}"
        @filters-changed="${this.filtersChanged}"
      ></mte-state-filter>
      ${this.renderTestList()} ${this.renderCode()}
    `;
  }

  private renderTestList() {
    const testsToRenderInTheList = this.tests.filter((test) => !test.location);
    if (testsToRenderInTheList.length) {
      return html`<ul class="max-w-6xl">
        ${repeat(
          testsToRenderInTheList,
          (test) => test.id,
          (test) =>
            html`<li class="my-3">
              <button
                class="w-full rounded-sm p-3 text-left hover:bg-gray-100 active:bg-gray-200"
                type="button"
                data-active="${this.selectedTest === test}"
                test-id="${test.id}"
                @click=${(ev: MouseEvent) => {
                  ev.stopPropagation();
                  this.toggleTest(test);
                }}
                >${getEmojiForTestStatus(test.status)} ${test.name} [${test.status}]
              </button>
            </li>`,
        )}
      </ul>`;
    }
    return nothing;
  }

  private renderCode() {
    if (this.model?.source) {
      const testsByLine = new Map<number, TestModel[]>();
      for (const test of this.tests) {
        if (test.location) {
          let tests = testsByLine.get(test.location.start.line);
          if (!tests) {
            tests = [];
            testsByLine.set(test.location.start.line, tests);
          }
          tests.push(test);
        }
      }

      const renderFinalTests = (lastLine: number) => {
        return this.renderTestDots([...testsByLine.entries()].filter(([line]) => line > lastLine).flatMap(([, tests]) => tests));
      };

      return html`<pre
        id="report-code-block"
        @click="${this.#deselectTest}"
        class="line-numbers flex rounded-md p-1"
      ><code class="flex language-${determineLanguage(this.model.name)}">
      <table>
        ${map(this.lines, (line, lineIndex) => {
        const lineNr = lineIndex + 1;
        const testDots = this.renderTestDots(testsByLine.get(lineNr));
        const finalTests = this.lines.length === lineNr ? renderFinalTests(lineNr) : nothing;

        return renderLine(line, renderDots(testDots, finalTests));
      })}</table></code></pre>`;
    }
    return nothing;
  }

  #deselectTest = () => {
    if (this.selectedTest) {
      this.toggleTest(this.selectedTest);
    }
  };

  private renderTestDots(tests: TestModel[] | undefined) {
    return tests?.length
      ? tests.map(
          (test) =>
            svg`<svg
              test-id="${test.id}"
              class="test-dot ${this.selectedTest?.id === test.id ? 'selected' : ''} ${test.status}"
              @click=${(ev: MouseEvent) => {
                ev.stopPropagation();
                this.toggleTest(test);
              }}
              height="10"
              width="12"
            >
              <title>${title(test)}</title>
              ${this.selectedTest === test ? triangle : circle}
            </svg>`,
        )
      : nothing;
  }

  public override reactivate(): void {
    super.reactivate();
    this.updateFileRepresentation();
  }

  override willUpdate(changes: PropertyValues<this>) {
    if (changes.has('model')) {
      this.updateFileRepresentation();
    }

    if ((changes.has('model') || changes.has('enabledStates')) && this.model) {
      this.tests = this.model.tests
        .filter((tests) => this.enabledStates.includes(tests.status))
        .sort((t1, t2) => {
          if (t1.location && t2.location) {
            return gte(t1.location.start, t2.location.start) ? 1 : -1;
          } else {
            // Keep original sorting
            return this.model!.tests.indexOf(t1) - this.model!.tests.indexOf(t2);
          }
        });
    }
  }

  private updateFileRepresentation() {
    if (!this.model) {
      return;
    }

    const model = this.model;
    this.filters = [TestStatus.Killing, TestStatus.Covering, TestStatus.NotCovering]
      .filter((status) => model.tests.some((test) => test.status === status))
      .map((status) => ({
        enabled: true,
        count: model.tests.filter((m) => m.status === status).length,
        status,
        label: html`${getEmojiForTestStatus(status)} ${status}`,
        context: getContextClassForTestStatus(status),
      }));
    if (this.model.source) {
      this.lines = transformHighlightedLines(highlightCode(this.model.source, this.model.name));
    }
  }

  #animateTestToggle(test: TestModel) {
    beginElementAnimation(this.renderRoot, 'test-id', test.id);
  }
}
function title(test: TestModel): string {
  return `${test.name} (${test.status})`;
}
