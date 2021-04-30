import { LitElement, html, property, customElement, unsafeCSS, PropertyValues } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { MutationTestReportMutantComponent } from '../mutant/mutant.component';
import { StateFilter } from '../state-filter/state-filter.component';
import { bootstrap, prismjs } from '../../style';
import { markMutants } from '../../lib/code-helpers';
import { FileResult, MutantStatus } from 'mutation-testing-report-schema';
import { highlightElement } from 'prismjs/components/prism-core';
import style from './file.scss';
import { getContextClassForStatus, getEmojiForStatus } from '../../lib/htmlHelpers';

@customElement('mte-file')
export class MutationTestReportFileComponent extends LitElement {
  @property()
  private filters: StateFilter<MutantStatus>[] = [];

  @property()
  public model!: FileResult;

  public static styles = [prismjs, bootstrap, unsafeCSS(style)];

  private readonly expandAll = () => {
    this.forEachMutantComponent((mutantComponent) => (mutantComponent.expand = true));
  };
  private readonly collapseAll = () => {
    this.forEachMutantComponent((mutantComponent) => (mutantComponent.expand = false));
  };

  private forEachMutantComponent(action: (mutant: MutationTestReportMutantComponent) => void) {
    for (const mutantComponent of this.shadowRoot!.querySelectorAll('mte-mutant')) {
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
    return html`
      <div class="row">
        <div class="col-md-12">
          <mte-state-filter
            allow-toggle-all
            .filters="${this.filters}"
            @filters-changed="${this.filtersChanged}"
            @expand-all="${this.expandAll}"
            @collapse-all="${this.collapseAll}"
          ></mte-state-filter>
          <pre id="report-code-block" class="line-numbers"><code class="language-${this.model.language}">${unsafeHTML(
            markMutants(this.model)
          )}</code></pre>
        </div>
      </div>
    `;
  }

  public firstUpdated() {
    const code = this.shadowRoot!.querySelector('code');
    if (code) {
      highlightElement(code);

      // Prism-js's `highlightElement` creates a copy of the DOM tree to do its magic.
      // Now that the code is highlighted, we can bind the mutants
      this.forEachMutantComponent((mutantComponent) => {
        mutantComponent.mutant = this.model.mutants.find((mutant) => mutant.id === mutantComponent.getAttribute('mutant-id'));
      });
    }
  }

  public updated(changes: PropertyValues) {
    if (changes.has('model') && this.model) {
      this.filters = [
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
          enabled: [MutantStatus.Survived, MutantStatus.NoCoverage, MutantStatus.Timeout].includes(status),
          count: this.model.mutants.filter((m) => m.status === status).length,
          status,
          label: `${getEmojiForStatus(status)} ${status}`,
          context: getContextClassForStatus(status),
        }));
    }
  }
}
