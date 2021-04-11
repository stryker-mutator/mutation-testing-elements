import { customElement, html, LitElement, property, PropertyValues, unsafeCSS } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

import { TestFileModel } from 'mutation-testing-metrics';
import { highlightElement } from 'prismjs/components/prism-core';
import style from './mutation-test-report-test-file.scss';

import '../../style/prism-plugins';
import { bootstrap, prismjs } from '../../style';
import { determineLanguage, markTests } from '../../lib/code-helpers';
import { MutationTestReportTestComponent } from '../mutation-test-report-test/mutation-test-report-test.component';
import { MteCustomEvent } from '../../lib/custom-events';
import { TestStatus } from 'mutation-testing-metrics/src/model/test-model';
import { getContextClassForTestStatus, getEmojiForTestStatus } from '../../lib/htmlHelpers';
import { StateFilter } from '../mutation-test-report-state-filter/mutation-test-report-state-filter.component';
import { MutationTestReportTestListItemComponent } from '../mutation-test-report-test-list-item/mutation-test-report-test-list-item.component';

@customElement('mutation-test-report-test-file')
export class MutationTestReportTestFile extends LitElement {
  @property()
  public model: TestFileModel | undefined;

  public static styles = [prismjs, bootstrap, unsafeCSS(style)];

  @property()
  private filters: StateFilter<TestStatus>[] = [];

  private forEachTestComponent(action: (test: MutationTestReportTestListItemComponent | MutationTestReportTestComponent) => void) {
    for (const testListItem of this.shadowRoot!.querySelectorAll('mutation-test-report-test-list-item')) {
      if (testListItem instanceof MutationTestReportTestListItemComponent) {
        action(testListItem);
      }
    }
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
      testComponent.active = testComponent.test === event.detail.test && event.detail.selected;
    });
  };

  public render() {
    return html`
      <div class="row" @test-selected="${this.handleTestSelected}">
        <div class="col-md-12">
          <mutation-test-report-state-filter .filters="${this.filters}" @filters-changed="${this.filtersChanged}"></mutation-test-report-state-filter>
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
          (test) =>
            html`<mutation-test-report-test-list-item
              @test-selected="${this.handleTestSelected}"
              .test="${test}"
            ></mutation-test-report-test-list-item>`
        )}
      </div>`;
    }
    return;
  }

  private renderCode() {
    if (this.model?.source) {
      return html`<pre id="report-code-block" class="line-numbers"><code class="language-${determineLanguage(this.model.name)}">${unsafeHTML(
        markTests(this.model.source, this.model.tests)
      )}</code></pre>`;
    }
    return;
  }

  private highlightCode() {
    const code = this.shadowRoot?.querySelector('code');
    if (code) {
      highlightElement(code);

      // Prism-js's `highlightElement` creates a copy of the DOM tree to do its magic.
      // Now that the code is highlighted, we can bind the test components
      this.forEachTestComponent((testComponent) => {
        testComponent.test = this.model?.tests.find((test) => test.id === testComponent.getAttribute('test-id'));
      });
    }
  }

  public updated(changes: PropertyValues) {
    if (changes.has('model') && this.model) {
      const model = this.model;
      this.filters = [TestStatus.Killing, TestStatus.NotKilling, TestStatus.NotCovering]
        .filter((status) => model.tests.some((test) => test.status === status))
        .map((status) => ({
          enabled: true,
          count: model.tests.filter((m) => m.status === status).length,
          status,
          label: `${getEmojiForTestStatus(status)} ${status}`,
          context: getContextClassForTestStatus(status),
        }));
      this.highlightCode();
    }
  }
}
