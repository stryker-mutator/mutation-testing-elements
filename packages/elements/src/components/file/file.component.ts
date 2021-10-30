import { LitElement, html, unsafeCSS, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { MutationTestReportMutantComponent } from '../mutant/mutant.component';
import { StateFilter } from '../state-filter/state-filter.component';
import { bootstrap, prismjs } from '../../style';
import { markMutants2 } from '../../lib/code-helpers';
import { MutantStatus } from 'mutation-testing-report-schema/api';
import { highlight, languages } from 'prismjs/components/prism-core';
import style from './file.scss';
import { getContextClassForStatus, getEmojiForStatus } from '../../lib/htmlHelpers';
import { FileUnderTestModel } from 'mutation-testing-metrics';
import { MteCustomEvent } from '../../lib/custom-events';

@customElement('mte-file')
export class MutationTestReportFileComponent extends LitElement {
  @property()
  private filters: StateFilter<MutantStatus>[] = [];

  @property()
  public model!: FileUnderTestModel;

  public static styles = [prismjs, bootstrap, unsafeCSS(style)];

  private codeRef = createRef<HTMLElement>();
  private innerCodeRef = createRef<HTMLSpanElement>();

  private readonly expandAll = () => {
    this.forEachMutantComponent((mutantComponent) => (mutantComponent.expand = true));
  };
  private readonly collapseAll = () => {
    this.forEachMutantComponent((mutantComponent) => (mutantComponent.expand = false));
  };
  private currentMutantId: string | undefined = undefined;

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
          <pre id="report-code-block" class="mte-line-numbers"><code ${ref(this.codeRef)} class="language-${this.model
            .language}"><table class="innerCode" ${ref(this.innerCodeRef)}>${unsafeHTML(markMutants2(this.model))}</table></code></pre>
        </div>
      </div>
    `;
  }

  public firstUpdated() {
    const diffOldClass = 'diff-old';
    const diffNewClass = 'diff-new';

    if (this.codeRef.value && this.model) {
      const codeElement = this.codeRef.value;
      // highlightElement(codeElement);

      // Prism-js's `highlightElement` creates a copy of the DOM tree to do its magic.
      // Now that the code is highlighted, we can bind the mutants
      this.forEachMutantComponent((mutantComponent) => {
        mutantComponent.mutant = this.model.mutants.find((mutant) => mutant.id === mutantComponent.getAttribute('mutant-id'));
        mutantComponent.addEventListener('mutant-selected', (ev: Event) => {
          const mutant = (ev as MteCustomEvent<'mutant-selected'>).detail.mutant;
          if (mutant) {
            this.removeCurrentDiff(codeElement, diffOldClass, diffNewClass);
            if (this.currentMutantId === mutant.id) {
              this.currentMutantId = undefined;
              return;
            }

            if (this.currentMutantId) {
              const currentMutant = codeElement.querySelectorAll(`mte-mutant[mutant-id="${this.currentMutantId}"]`)[0];
              if (currentMutant instanceof MutationTestReportMutantComponent) {
                currentMutant.expand = !currentMutant.expand;
              }
            }

            this.currentMutantId = mutant.id;
            const lines = codeElement.querySelectorAll('tr');
            for (let i = mutant.location.start.line - 1; i < mutant.location.end.line; i++) {
              lines.item(i).classList.add(diffOldClass);
            }
            const mutatedHighlighted = highlight(mutant.getMutatedLines(), languages[this.model.language], this.model.language);
            lines
              .item(mutant.location.end.line - 1)
              .insertAdjacentHTML(
                'afterend',
                `<tr class="${diffNewClass}"><td class="empty-line-number"></td><td class="line-marker"></td><td>${mutatedHighlighted}</td></tr>`
              );
          }
        });
      });
    }
  }

  private removeCurrentDiff(code: HTMLElement, diffOldClass: string, diffNewClass: string) {
    const oldDiffLines = code.querySelectorAll(`.${diffOldClass}`);
    if (!oldDiffLines) {
      return;
    }

    oldDiffLines.forEach((oldDiffLine) => oldDiffLine.classList.remove(diffOldClass));

    const newDiffLines = code.querySelectorAll(`.${diffNewClass}`);
    newDiffLines.forEach((newDiffLine) => newDiffLine.remove());
  }

  public update(changes: PropertyValues) {
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
    super.update(changes);
  }
}
