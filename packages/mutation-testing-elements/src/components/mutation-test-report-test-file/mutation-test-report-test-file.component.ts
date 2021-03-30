import { customElement, html, LitElement, property, unsafeCSS } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

import { TestFileModel } from 'mutation-testing-metrics';
import { highlightElement } from 'prismjs/components/prism-core';
import style from './mutation-test-report-test-file.scss';

import '../../style/prism-plugins';
import { bootstrap, prismjs } from '../../style';
import { markTests } from '../../lib/codeHelpers';
import { MutationTestReportTestComponent } from '../mutation-test-report-test/mutation-test-report-test.component';
import { createCustomEvent, MteCustomEvent } from '../../lib/custom-events';
import { TestStatus } from 'mutation-testing-metrics/src/model/test-model';
import { getContextClassForTestStatus, getEmojiForTestStatus } from '../../lib/htmlHelpers';
import { StateFilter } from '../mutation-test-report-state-filter/mutation-test-report-state-filter.component';

@customElement('mutation-test-report-test-file')
export class MutationTestReportTestFile extends LitElement {
  @property()
  public model!: TestFileModel;

  public static styles = [prismjs, bootstrap, unsafeCSS(style)];

  public disconnectedCallback() {
    this.dispatchEvent(createCustomEvent('test-selected', { selected: false, test: undefined }, { bubbles: true, composed: true }));
  }

  private forEachTestComponent(action: (test: MutationTestReportTestComponent) => void) {
    for (const testComponent of this.shadowRoot!.querySelectorAll('mutation-test-report-test')) {
      if (testComponent instanceof MutationTestReportTestComponent) {
        action(testComponent);
      }
    }
  }

  private readonly filtersChanged = (event: CustomEvent<StateFilter<TestStatus>[]>) => {
    const enabledStates = event.detail.filter((filter) => filter.enabled).map((filter) => filter.status);
    this.forEachTestComponent((testComponent) => {
      testComponent.show = enabledStates.some((state) => testComponent.test?.status === state);
    });
  };

  private readonly handleTestSelected = (event: MteCustomEvent<'test-selected'>) => {
    this.forEachTestComponent((testComponent) => {
      testComponent.expand = testComponent.test === event.detail.test && event.detail.selected;
    });
  };

  public render() {
    const filters: StateFilter<TestStatus>[] = [TestStatus.Killing, TestStatus.NotKilling, TestStatus.NotCovering]
      .filter((status) => this.model.tests.some((test) => test.status === status))
      .map((status) => ({
        enabled: true,
        count: this.model.tests.filter((m) => m.status === status).length,
        status,
        label: `${getEmojiForTestStatus(status)} ${status}`,
        context: getContextClassForTestStatus(status),
      }));
    return html`
      <div class="row" @test-selected="${this.handleTestSelected}">
        <div class="col-md-12">
          <mutation-test-report-state-filter
            .filters="${filters}"
            @filters-changed="${this.filtersChanged}""
          ></mutation-test-report-state-filter>
          <pre id="report-code-block" class="line-numbers"><code class="language-typescript">${unsafeHTML(markTests(this.model))}</code></pre>
        </div>
      </div>
    `;
  }

  public firstUpdated() {
    const code = this.shadowRoot?.querySelector('code');
    if (code) {
      highlightElement(code);

      // Prism-js's `highlightElement` creates a copy of the DOM tree to do its magic.
      // Now that the code is highlighted, we can bind the tests
      this.forEachTestComponent((testComponent) => {
        testComponent.test = this.model.tests.find((test) => test.id === testComponent.getAttribute('test-id'));
      });
    }
  }
}
