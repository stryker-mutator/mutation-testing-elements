import { html, LitElement, PropertyValues, unsafeCSS } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement, property } from 'lit/decorators.js';

import { TestFileModel, TestStatus } from 'mutation-testing-metrics';
import style from './test-file.scss';

import '../../style/prism-plugins';
import { bootstrap, prismjs } from '../../style';
import { determineLanguage, highlightedCodeTableWithTests } from '../../lib/code-helpers';
import { MutationTestReportTestComponent } from '../test/test.component';
import { MteCustomEvent } from '../../lib/custom-events';
import { getContextClassForTestStatus, getEmojiForTestStatus } from '../../lib/htmlHelpers';
import { StateFilter } from '../state-filter/state-filter.component';
import { MutationTestReportTestListItemComponent } from '../test-list-item/test-list-item.component';

@customElement('mte-test-file')
export class MutationTestReportTestFile extends LitElement {
  @property()
  public model: TestFileModel | undefined;

  public static styles = [prismjs, bootstrap, unsafeCSS(style)];

  @property()
  private filters: StateFilter<TestStatus>[] = [];

  private forEachTestComponent(action: (test: MutationTestReportTestListItemComponent | MutationTestReportTestComponent) => void) {
    for (const testListItem of this.shadowRoot!.querySelectorAll('mte-test-list-item')) {
      if (testListItem instanceof MutationTestReportTestListItemComponent) {
        action(testListItem);
      }
    }
    for (const testComponent of this.shadowRoot!.querySelectorAll('mte-test')) {
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
          <mte-state-filter .filters="${this.filters}" @filters-changed="${this.filtersChanged}"></mte-state-filter>
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
          (test) => html`<mte-test-list-item @test-selected="${this.handleTestSelected}" .test="${test}"></mte-test-list-item>`
        )}
      </div>`;
    }
    return;
  }

  private renderCode() {
    if (this.model?.source) {
      return html`<pre id="report-code-block" class="line-numbers"><code class="language-${determineLanguage(this.model.name)}"><span>${unsafeHTML(
        highlightedCodeTableWithTests(this.model, this.model.source)
      )}</span></code></pre>`;
    }
    return;
  }

  override update(changes: PropertyValues) {
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
    }
    super.update(changes);
  }

  public updated(changes: PropertyValues) {
    if (changes.has('model') && this.model) {
      this.forEachTestComponent((testComponent) => {
        testComponent.test = this.model?.tests.find((test) => test.id === testComponent.getAttribute('test-id'));
      });
    }
  }
}
