import { LitElement, html, unsafeCSS, PropertyValues, svg } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { StateFilter } from '../state-filter/state-filter.component';
import { bootstrap, prismjs } from '../../style';
import { findDiffIndices, gte, highlightCode, transformHighlightedLines } from '../../lib/code-helpers';
import { MutantResult, MutantStatus } from 'mutation-testing-report-schema/api';
import style from './file.scss';
import { getContextClassForStatus, getEmojiForStatus, scrollToCodeFragmentIfNeeded } from '../../lib/html-helpers';
import { FileUnderTestModel, MutantModel } from 'mutation-testing-metrics';
import { createCustomEvent, MteCustomEvent } from '../../lib/custom-events';

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
  private lines: string[] = [];

  @state()
  public mutants: MutantModel[] = [];

  public static styles = [prismjs, bootstrap, unsafeCSS(style)];
  private codeRef = createRef<HTMLElement>();

  private readonly filtersChanged = (event: MteCustomEvent<'filters-changed'>) => {
    this.selectedMutantStates = event.detail as MutantStatus[];
  };

  private codeClicked = (ev: MouseEvent) => {
    ev.stopPropagation();

    if (ev.target instanceof Element) {
      let maybeMutantTarget: Element | null = ev.target;
      const mutantIdsInScope: string[] = [];
      for (; maybeMutantTarget instanceof Element; maybeMutantTarget = maybeMutantTarget.parentElement) {
        const mutantId = maybeMutantTarget.getAttribute('mutant-id');
        if (mutantId && this.mutants.some(({ id }) => id === mutantId)) {
          mutantIdsInScope.push(mutantId);
        }
      }
      const index = (this.selectedMutantId ? mutantIdsInScope.indexOf(this.selectedMutantId) : -1) + 1;
      if (mutantIdsInScope[index]) {
        this.toggleMutant(mutantIdsInScope[index]);
      } else if (this.selectedMutantId) {
        this.toggleMutant(this.selectedMutantId);
      }
      clearSelection();
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
    const renderFinalMutants = (lastLine: number) => {
      return this.renderMutants([...mutantLineMap.entries()].filter(([line]) => line > lastLine).flatMap(([, mutants]) => mutants));
    };

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
          <pre
            @click="${this.codeClicked}"
            id="report-code-block"
            class="line-numbers ${this.selectedMutantStates.map((state) => `mte-selected-${state}`).join(' ')}"
          ><code ${ref(this.codeRef)} class="language-${this.model.language}"><table>${this.lines.map((line, lineIndex) => {
            const lineNr = lineIndex + 1;
            return html`<tr class="line"
              ><td class="line-number"></td><td class="line-marker"></td
              ><td class="code"
                >${unsafeHTML(line)}${this.renderMutants(mutantLineMap.get(lineNr))}${this.lines.length === lineNr
                  ? renderFinalMutants(lineNr)
                  : ''}</td
              ></tr
            >`;
          })}</table></code></pre>
        </div>
      </div>
    `;
  }

  private nextMutant = () => {
    const index = this.selectedMutantId ? (this.mutants.findIndex((mutant) => mutant.id === this.selectedMutantId) + 1) % this.mutants.length : 0;
    if (this.mutants[index]) {
      this.toggleMutant(this.mutants[index].id);
    }
  };
  private previousMutant = () => {
    const index = this.selectedMutantId
      ? (this.mutants.findIndex((mutant) => mutant.id === this.selectedMutantId) + this.mutants.length - 1) % this.mutants.length
      : this.mutants.length - 1;
    if (this.mutants[index]) {
      this.toggleMutant(this.mutants[index].id);
    }
  };

  private renderMutants(mutants: MutantModel[] | undefined) {
    return html`${mutants?.map(
      (mutant) =>
        svg`<svg mutant-id="${mutant.id}" class="mutant-dot ${
          this.selectedMutantId === mutant.id ? 'selected' : mutant.status
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
      this.dispatchEvent(createCustomEvent('mutant-selected', { selected: false, mutant }));
      return;
    }

    this.selectedMutantId = mutantId;
    const lines = this.codeRef.value!.querySelectorAll('tr.line');
    for (let i = mutant.location.start.line - 1; i < mutant.location.end.line; i++) {
      lines.item(i).classList.add(diffOldClass);
    }
    const mutatedLines = this.highlightedReplacementRows(mutant);
    const mutantEndRow = lines.item(mutant.location.end.line - 1);
    mutantEndRow.insertAdjacentHTML('afterend', mutatedLines);
    scrollToCodeFragmentIfNeeded(mutantEndRow);
    this.dispatchEvent(createCustomEvent('mutant-selected', { selected: true, mutant }));
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

      this.lines = transformHighlightedLines(highlightedSource, function* (position) {
        // End previously opened mutants
        for (const mutant of startedMutants) {
          if (gte(position, mutant.location.end)) {
            startedMutants.delete(mutant);
            yield { elementName: 'span', id: mutant.id, isClosing: true };
          }
        }

        // Open new mutants
        for (const mutant of mutantsToPlace) {
          if (gte(position, mutant.location.start)) {
            startedMutants.add(mutant);
            mutantsToPlace.delete(mutant);
            yield {
              elementName: 'span',
              id: mutant.id,
              attributes: { class: `mutant ${mutant.status}`, title: title(mutant), 'mutant-id': mutant.id },
            };
          }
        }
      });
    }
    if ((changes.has('model') && this.model) || changes.has('selectedMutantStates')) {
      this.mutants = this.model.mutants
        .filter((mutant) => this.selectedMutantStates.includes(mutant.status))
        .sort((m1, m2) => (gte(m1.location.start, m2.location.start) ? 1 : -1));
      if (this.selectedMutantId && !this.mutants.some(({ id }) => this.selectedMutantId === id)) {
        this.toggleMutant(this.selectedMutantId);
      }
    }
    super.update(changes);
  }

  private highlightedReplacementRows(mutant: MutantModel): string {
    const mutatedLines = mutant.getMutatedLines().trimEnd();
    const originalLines = mutant.getOriginalLines().trimEnd();

    const [focusFrom, focusTo] = findDiffIndices(originalLines, mutatedLines);

    const lines = transformHighlightedLines(highlightCode(mutatedLines, this.model.name), function* ({ offset }) {
      if (offset === focusFrom) {
        yield { elementName: 'span', id: 'diff-focus', attributes: { class: 'diff-focus' } };
      } else if (offset === focusTo) {
        yield { elementName: 'span', id: 'diff-focus', isClosing: true };
      }
      return;
    });
    const lineStart = `<tr class="${diffNewClass}"><td class="empty-line-number"></td><td class="line-marker"></td><td class="code">`;
    const lineEnd = '</td></tr>';
    return lines.map((line) => `${lineStart}${line}${lineEnd}`).join('');
  }
}

function title(mutant: MutantModel): string {
  return `${mutant.mutatorName} ${mutant.status}`;
}

function clearSelection() {
  window.getSelection()?.removeAllRanges();
}
