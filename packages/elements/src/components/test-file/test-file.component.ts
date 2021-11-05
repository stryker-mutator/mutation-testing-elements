import { html, LitElement, PropertyValues, svg, unsafeCSS } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement, property, state } from 'lit/decorators.js';

import { TestFileModel, TestModel, TestStatus } from 'mutation-testing-metrics';
import style from './test-file.scss';

import '../../style/prism-plugins';
import { bootstrap, prismjs } from '../../style';
import { determineLanguage, transformHighlightedLines, highlightCode, gte } from '../../lib/code-helpers';
import { createCustomEvent } from '../../lib/custom-events';
import { getContextClassForTestStatus, getEmojiForTestStatus, scrollToCodeFragmentIfNeeded } from '../../lib/html-helpers';
import { StateFilter } from '../state-filter/state-filter.component';

@customElement('mte-test-file')
export class TestFileComponent extends LitElement {
  @property()
  public model: TestFileModel | undefined;

  public static styles = [prismjs, bootstrap, unsafeCSS(style)];

  @property()
  private filters: StateFilter<TestStatus>[] = [];

  @state()
  private lines: string[] = [];

  @state()
  public enabledStates: TestStatus[] = [];

  @state()
  private selectedTest: TestModel | undefined;

  @state()
  private tests: TestModel[] = [];

  private readonly filtersChanged = (event: CustomEvent<StateFilter<TestStatus>[]>) => {
    this.enabledStates = event.detail.filter((filter) => filter.enabled).map((filter) => filter.status);
    if (this.selectedTest && !this.enabledStates.includes(this.selectedTest.status)) {
      this.toggleTest(this.selectedTest);
    }
  };

  private toggleTest(test: TestModel) {
    if (this.selectedTest === test) {
      this.selectedTest = undefined;
      this.dispatchEvent(createCustomEvent('test-selected', { selected: false, test }));
    } else {
      this.selectedTest = test;
      this.dispatchEvent(createCustomEvent('test-selected', { selected: true, test }));
      scrollToCodeFragmentIfNeeded(this.shadowRoot!.querySelector(`[test-id="${test.id}"]`));
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
      <div class="row">
        <div class="col-md-12">
          <mte-state-filter
            @next=${this.nextTest}
            @previous=${this.previousTest}
            .filters="${this.filters}"
            @filters-changed="${this.filtersChanged}"
          ></mte-state-filter>
          ${this.renderTestList()} ${this.renderCode()}
        </div>
      </div>
    `;
  }

  private renderTestList() {
    const testsToRenderInTheList = this.model?.source ? this.model.tests.filter((test) => !test.location) : this.model?.tests ?? [];
    if (testsToRenderInTheList.length) {
      return html`<div class="list-group">
        ${testsToRenderInTheList.map(
          (test) => html`<button
            type="button"
            test-id="${test.id}"
            @click=${(ev: MouseEvent) => {
              ev.stopPropagation();
              this.toggleTest(test);
            }}
            class="list-group-item list-group-item-action${this.selectedTest?.id === test.id ? ' active' : ''}"
            ><span class="emblem">${getEmojiForTestStatus(test.status)}</span> ${test.name}${test.location
              ? html` (${test.location.start.line}:${test.location.start.column})`
              : ''}
            [${test.status}]</button
          >`
        )}
      </div>`;
    }
    return;
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
      return html`<pre id="report-code-block" class="line-numbers"><code class="language-${determineLanguage(this.model.name)}"><table>
        ${this.lines.map(
        (line, lineNr) =>
          html`<tr class="line"
            ><td class="line-number"></td><td class="line-marker"></td
            ><td class="code">${unsafeHTML(line)}${this.renderTests(testsByLine.get(lineNr + 1))}</td></tr
          >`
      )}</table></code></pre>`;
    }
    return;
  }

  private renderTests(tests: TestModel[] | undefined) {
    return html`${tests?.map(
      (test) =>
        svg`<svg test-id="${test.id}" class="test-dot ${this.selectedTest === test ? 'selected' : test.status}" @click=${(ev: MouseEvent) => {
          ev.stopPropagation();
          this.toggleTest(test);
        }} height="10" width="10">
          <title>${title(test)}</title>
          <circle cx="5" cy="5" r="5" />
          </svg>`
    )}`;
  }

  override update(changes: PropertyValues<TestFileComponent>) {
    if (changes.has('model') && this.model) {
      const model = this.model;
      this.filters = [TestStatus.Killing, TestStatus.Covering, TestStatus.NotCovering]
        .filter((status) => model.tests.some((test) => test.status === status))
        .map((status) => ({
          enabled: true,
          count: model.tests.filter((m) => m.status === status).length,
          status,
          label: `${getEmojiForTestStatus(status)} ${status}`,
          context: getContextClassForTestStatus(status),
        }));

      if (this.model.source) {
        this.lines = transformHighlightedLines(highlightCode(this.model.source, this.model.name));
      }
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
    super.update(changes);
  }
}
function title(test: TestModel): string {
  return `${test.name} (${test.status})`;
}
