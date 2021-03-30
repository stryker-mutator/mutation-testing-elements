import { LitElement, html, property, customElement, unsafeCSS } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { MutationTestReportMutantComponent } from '../mutation-test-report-mutant/mutation-test-report-mutant.component';
import { StateFilter } from '../mutation-test-report-state-filter/mutation-test-report-state-filter.component';
import { bootstrap, prismjs } from '../../style';
import { markMutants } from '../../lib/codeHelpers';
import { FileResult, MutantStatus } from 'mutation-testing-report-schema';
import { highlightElement } from 'prismjs/components/prism-core';
import style from './mutation-test-report-file.scss';
import { createCustomEvent } from '../../lib/custom-events';
import { getContextClassForStatus, getEmojiForStatus } from '../../lib/htmlHelpers';

@customElement('mutation-test-report-file')
export class MutationTestReportFileComponent extends LitElement {
  @property()
  public model!: FileResult;

  public static styles = [prismjs, bootstrap, unsafeCSS(style)];

  private readonly expandAll = () => {
    this.forEachMutantComponent((mutantComponent) => (mutantComponent.expand = true));
  };
  private readonly collapseAll = () => {
    this.forEachMutantComponent((mutantComponent) => (mutantComponent.expand = false));
  };

  public disconnectedCallback() {
    this.dispatchEvent(createCustomEvent('mutant-selected', { selected: false, mutant: undefined }, { bubbles: true, composed: true }));
  }

  private forEachMutantComponent(action: (mutant: MutationTestReportMutantComponent) => void, host = this.root) {
    for (const mutantComponent of host.querySelectorAll('mutation-test-report-mutant')) {
      if (mutantComponent instanceof MutationTestReportMutantComponent) {
        action(mutantComponent);
      }
    }
  }

  private readonly filtersChanged = (event: CustomEvent<StateFilter<MutantStatus>[]>) => {
    const enabledMutantStates = event.detail.filter((mutantFilter) => mutantFilter.enabled).map((mutantFilter) => mutantFilter.status);
    this.forEachMutantComponent((mutantComponent) => {
      mutantComponent.show = enabledMutantStates.some((state) => mutantComponent.mutant !== undefined && mutantComponent.mutant.status === state);
    });
  };

  public render() {
    const filters: StateFilter<MutantStatus>[] = [
      MutantStatus.Killed,
      MutantStatus.Survived,
      MutantStatus.NoCoverage,
      MutantStatus.Ignored,
      MutantStatus.Timeout,
      MutantStatus.CompileError,
      MutantStatus.RuntimeError,
    ]
      .filter((status) => this.model.mutants.some((mutant) => mutant.status === status))
      .map((status) => ({
        enabled: [MutantStatus.Survived, MutantStatus.NoCoverage, MutantStatus.Timeout].some((s) => s === status),
        count: this.model.mutants.filter((m) => m.status === status).length,
        status,
        label: `${getEmojiForStatus(status)} ${status}`,
        context: getContextClassForStatus(status),
      }));
    return html`
      <div class="row">
        <div class="col-md-12">
          <mutation-test-report-state-filter
            .filters="${filters}"
            @filters-changed="${this.filtersChanged}"
            @expand-all="${this.expandAll}"
            @collapse-all="${this.collapseAll}"
          ></mutation-test-report-state-filter>
          <pre id="report-code-block" class="line-numbers"><code class="language-${this.model.language}">${unsafeHTML(
            markMutants(this.model)
          )}</code></pre>
        </div>
      </div>
    `;
  }

  public firstUpdated() {
    const code = this.root.querySelector('code');
    if (code) {
      highlightElement(code);

      // Prism-js's `highlightElement` creates a copy of the DOM tree to do its magic.
      // Now that the code is highlighted, we can bind the mutants
      this.forEachMutantComponent((mutantComponent) => {
        mutantComponent.mutant = this.model.mutants.find((mutant) => mutant.id === mutantComponent.getAttribute('mutant-id'));
      }, code);
    }
  }

  private get root(): ParentNode {
    return this.shadowRoot || this;
  }
}
