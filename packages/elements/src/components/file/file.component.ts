import { LitElement, html, unsafeCSS, PropertyValues, svg } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { StateFilter } from '../state-filter/state-filter.component';
import { bootstrap, prismjs } from '../../style';
import { gte, highlightCode, highlightedReplacementRows, HtmlTag, transformHighlightedLines } from '../../lib/code-helpers';
import { MutantResult, MutantStatus } from 'mutation-testing-report-schema/api';
import style from './file.scss';
import { getContextClassForStatus, getEmojiForStatus } from '../../lib/html-helpers';
import { FileUnderTestModel, MutantModel } from 'mutation-testing-metrics';
import { MutantMarkCalculator } from '../../lib/mutant-mark-calculator';

const diffOldClass = 'diff-old';
const diffNewClass = 'diff-new';
@customElement('mte-file')
export class FileComponent extends LitElement {
  @state()
  public filters: StateFilter<MutantStatus>[] = [];

  @property()
  public model!: FileUnderTestModel;

  @state()
  public selectedMutantStates: MutantStatus[] = [];

  @state()
  private selectedMutantId?: string;

  @state()
  private codeLines: string[] = [];

  @state()
  private mutants: MutantModel[] = [];

  public static styles = [prismjs, bootstrap, unsafeCSS(style)];
  private codeRef = createRef<HTMLElement>();

  private readonly filtersChanged = (event: CustomEvent<StateFilter<MutantStatus>[]>) => {
    this.selectedMutantStates = event.detail.filter((mutantFilter) => mutantFilter.enabled).map((mutantFilter) => mutantFilter.status);
  };

  private codeClicked = (ev: MouseEvent) => {
    if (ev.target instanceof Element) {
      let mutantId: string | null = null;
      let maybeMutantTarget: Element | null = ev.target;
      while (maybeMutantTarget instanceof Element) {
        mutantId = maybeMutantTarget.getAttribute('mutant-id');
        if (mutantId) {
          break;
        }
        maybeMutantTarget = maybeMutantTarget.parentElement;
      }
      if (mutantId) {
        this.toggleMutant(mutantId);
      }
    }
  };

  public render() {
    const mutantLineMap = new Map<number, MutantModel[]>();
    for (const mutant of this.mutants) {
      let mutants = mutantLineMap.get(mutant.location.start.line);
      if (!mutants) {
        mutants = [];
        mutantLineMap.set(mutant.location.start.line, mutants);
      }
      mutants.push(mutant);
    }
    return html`
      <div class="row">
        <div class="col-md-12">
          <mte-state-filter
            allow-toggle-all
            .filters="${this.filters}"
            @filters-changed="${this.filtersChanged}"
            @next=${this.nextMutant}
            @previous=${this.previousMutant}
          ></mte-state-filter>
          <pre @click="${this.codeClicked}" id="report-code-block" class="line-numbers"><code ${ref(this.codeRef)} class="language-${this.model
            .language}"><table>${this.codeLines.map(
            (line, lineNr) => html`<tr class="line"
              ><td class="line-number"></td><td class="line-marker"></td
              ><td class="code">${unsafeHTML(line)}${this.renderMutants(mutantLineMap.get(lineNr + 1))}</td></tr
            >`
          )}</table></code></pre>
        </div>
      </div>
    `;
  }

  private nextMutant = () => {
    const index = this.selectedMutantId ? (this.mutants.findIndex((mutant) => mutant.id === this.selectedMutantId) + 1) % this.mutants.length : 0;
    this.toggleMutant(this.mutants[index].id);
  };
  private previousMutant = () => {
    const index = (this.mutants.findIndex((mutant) => mutant.id === this.selectedMutantId) + this.mutants.length - 1) % this.mutants.length;
    this.toggleMutant(this.mutants[index].id);
  };

  private renderMutants(mutants: MutantModel[] | undefined) {
    return html`${mutants?.map(
      (mutant) =>
        svg`<svg class="mutant ${this.selectedMutantId === mutant.id ? 'info' : getContextClassForStatus(mutant.status)}"  mutant-id="${
          mutant.id
        }" height="10" width="10">
          <title>${title(mutant)}</title>
          <circle cx="5" cy="5" r="5" />
          </svg>`
    )}`;
  }

  private toggleMutant(mutantId: string) {
    const mutant = this.model.mutants.find((mutant) => mutant.id === mutantId)!;
    this.removeCurrentDiff();
    if (this.selectedMutantId === mutantId) {
      this.selectedMutantId = undefined;
      return;
    }

    this.selectedMutantId = mutantId;
    const lines = this.codeRef.value!.querySelectorAll('tr.line');
    for (let i = mutant.location.start.line - 1; i < mutant.location.end.line; i++) {
      lines.item(i).classList.add(diffOldClass);
    }
    const mutatedLines = highlightedReplacementRows(mutant, this.model.language);
    const mutantEndRow = lines.item(mutant.location.end.line - 1);
    mutantEndRow.insertAdjacentHTML('afterend', mutatedLines);
    if (!isElementInViewport(mutantEndRow)) {
      mutantEndRow.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  private removeCurrentDiff() {
    const oldDiffLines = this.codeRef.value!.querySelectorAll(`.${diffOldClass}`);
    oldDiffLines.forEach((oldDiffLine) => oldDiffLine.classList.remove(diffOldClass));
    const newDiffLines = this.codeRef.value!.querySelectorAll(`.${diffNewClass}`);
    newDiffLines.forEach((newDiffLine) => newDiffLine.remove());
  }

  public update(changes: PropertyValues<FileComponent>) {
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
      const highlightedSource = highlightCode(this.model.source, this.model.name);
      const startedMutants = new Set<MutantResult>();
      const mutantsToPlace = new Set(this.model.mutants);
      const mutantMarker = new MutantMarkCalculator();

      this.codeLines = transformHighlightedLines(highlightedSource, (position) => {
        const bgBefore = mutantMarker.determineMarkerClass();
        const tags: HtmlTag[] = [];
        for (const mutant of startedMutants) {
          if (gte(position, mutant.location.end)) {
            mutantMarker.markMutantEnd(mutant);
            startedMutants.delete(mutant);
            tags.push({ elementName: 'span', id: mutant.id, isClosing: true });
          }
        }
        const mutantsToStart = [...mutantsToPlace.values()].filter((mutant) => gte(position, mutant.location.start));

        for (const mutant of mutantsToStart) {
          mutantMarker.markMutantStart(mutant);
          startedMutants.add(mutant);
          mutantsToPlace.delete(mutant);
          tags.push({
            elementName: 'span',
            id: mutant.id,
            attributes: { class: 'mutant', title: title(mutant), 'mutant-id': mutant.id },
          });
        }
        const bgAfter = mutantMarker.determineMarkerClass();
        if (bgBefore !== bgAfter) {
          if (bgBefore) {
            tags.push({ elementName: 'span', id: 'bg-marker', isClosing: true });
          }
          if (bgAfter) {
            tags.push({ elementName: 'span', id: 'bg-marker', attributes: { class: bgAfter } });
          }
        }
        return { tags };
      });
    }
    if ((changes.has('model') && this.model) || changes.has('selectedMutantStates')) {
      this.mutants = this.model.mutants
        .filter((mutant) => this.selectedMutantStates.includes(mutant.status))
        .sort((m1, m2) => (gte(m1.location.start, m2.location.start) ? 1 : -1));
    }
    super.update(changes);
  }
}
function title(mutant: MutantModel): string {
  return `${mutant.mutatorName} ${mutant.status}`;
}

function isElementInViewport(el: Element) {
  const { top, bottom } = el.getBoundingClientRect();

  return top >= 0 && bottom <= (window.innerHeight || document.documentElement.clientHeight);
}
