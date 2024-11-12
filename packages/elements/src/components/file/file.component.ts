import type { PropertyValues } from 'lit';
import { html, nothing, svg, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { createRef, ref } from 'lit/directives/ref.js';
import type { FileUnderTestModel, MutantModel } from 'mutation-testing-metrics';
import type { MutantResult, MutantStatus } from 'mutation-testing-report-schema/api';
import { findDiffIndices, gte, highlightCode, transformHighlightedLines } from '../../lib/code-helpers.js';
import type { MteCustomEvent } from '../../lib/custom-events.js';
import { createCustomEvent } from '../../lib/custom-events.js';
import { escapeHtml, getContextClassForStatus, getEmojiForStatus, scrollToCodeFragmentIfNeeded } from '../../lib/html-helpers.js';
import { prismjs, tailwind } from '../../style/index.js';
import { RealTimeElement } from '../real-time-element.js';
import type { StateFilter } from '../state-filter/state-filter.component.js';
import style from './file.scss?inline';
import { renderDots, renderLine } from './util.js';

const diffOldClass = 'diff-old';
const diffNewClass = 'diff-new';
@customElement('mte-file')
export class FileComponent extends RealTimeElement {
  static styles = [prismjs, tailwind, unsafeCSS(style)];

  @state()
  public declare filters: StateFilter<MutantStatus>[];

  @property()
  public declare model: FileUnderTestModel;

  @state()
  public declare selectedMutantStates: MutantStatus[];

  @state()
  private declare selectedMutant?: MutantModel;

  @state()
  private declare lines: string[];

  @state()
  public declare mutants: MutantModel[];

  private codeRef = createRef<HTMLElement>();

  public constructor() {
    super();
    this.filters = [];
    this.selectedMutantStates = [];
    this.lines = [];
    this.mutants = [];
  }

  private readonly filtersChanged = (event: MteCustomEvent<'filters-changed'>) => {
    // Pending is not filterable, but they should still be shown to the user.
    this.selectedMutantStates = (event.detail as MutantStatus[]).concat(['Pending']);
  };

  private codeClicked = (ev: MouseEvent) => {
    ev.stopPropagation();

    if (ev.target instanceof Element) {
      let maybeMutantTarget: Element | null = ev.target;
      const mutantsInScope: MutantModel[] = [];
      for (; maybeMutantTarget instanceof Element; maybeMutantTarget = maybeMutantTarget.parentElement) {
        const mutantId = maybeMutantTarget.getAttribute('mutant-id');
        const mutant = this.mutants.find(({ id }) => id.toString() === mutantId);
        if (mutant) {
          mutantsInScope.push(mutant);
        }
      }
      const index = (this.selectedMutant ? mutantsInScope.indexOf(this.selectedMutant) : -1) + 1;
      if (mutantsInScope[index]) {
        this.toggleMutant(mutantsInScope[index]);
        clearSelection();
      } else if (this.selectedMutant) {
        this.toggleMutant(this.selectedMutant);
        clearSelection();
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
    const renderFinalMutants = (lastLine: number) => {
      return this.renderMutantDots([...mutantLineMap.entries()].filter(([line]) => line > lastLine).flatMap(([, mutants]) => mutants));
    };

    return html`
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
        class="line-numbers ${this.selectedMutantStates.map((state) => `mte-selected-${state}`).join(' ')} flex rounded-md py-4"
      >
        <code ${ref(this.codeRef)} class="flex language-${this.model.language}">
          <table>${map(this.lines, (line, lineIndex) => {
        const lineNr = lineIndex + 1;
        const mutantDots = this.renderMutantDots(mutantLineMap.get(lineNr));
        const finalMutants = this.lines.length === lineNr ? renderFinalMutants(lineNr) : nothing;

        return renderLine(line, renderDots(mutantDots, finalMutants));
      })}</table>
          </code>
          </pre>
    `;
  }

  private nextMutant = () => {
    const index = this.selectedMutant ? (this.mutants.indexOf(this.selectedMutant) + 1) % this.mutants.length : 0;
    if (this.mutants[index]) {
      this.toggleMutant(this.mutants[index]);
    }
  };
  private previousMutant = () => {
    const index = this.selectedMutant
      ? (this.mutants.indexOf(this.selectedMutant) + this.mutants.length - 1) % this.mutants.length
      : this.mutants.length - 1;
    if (this.mutants[index]) {
      this.toggleMutant(this.mutants[index]);
    }
  };

  private renderMutantDots(mutants: MutantModel[] | undefined) {
    return mutants?.length
      ? mutants.map(
          (mutant) =>
            svg`<svg mutant-id="${mutant.id}" class="mutant-dot ${this.selectedMutant?.id === mutant.id ? 'selected' : ''} ${mutant.status}" height="10" width="12">
              <title>${title(mutant)}</title>
              ${
                this.selectedMutant?.id === mutant.id
                  ? // Triangle pointing down
                    svg`<path class="stroke-gray-800" d="M5,10 L0,0 L10,0 Z" />`
                  : // Circle
                    svg`<circle cx="5" cy="5" r="5" />`
              }
            </svg>`,
        )
      : nothing;
  }

  private toggleMutant(mutant: MutantModel) {
    this.removeCurrentDiff();

    if (this.selectedMutant === mutant) {
      this.selectedMutant = undefined;
      this.dispatchEvent(createCustomEvent('mutant-selected', { selected: false, mutant }));
      return;
    }

    this.selectedMutant = mutant;
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

  public override reactivate(): void {
    super.reactivate();
    this.updateFileRepresentation();
  }

  public update(changes: PropertyValues<FileComponent>) {
    if (changes.has('model') && this.model) {
      this.updateFileRepresentation();
    }
    if ((changes.has('model') && this.model) || changes.has('selectedMutantStates')) {
      this.mutants = this.model.mutants
        .filter((mutant) => this.selectedMutantStates.includes(mutant.status))
        .sort((m1, m2) => (gte(m1.location.start, m2.location.start) ? 1 : -1));

      if (
        this.selectedMutant &&
        !this.mutants.includes(this.selectedMutant) &&
        changes.has('selectedMutantStates') &&
        // This extra check is to allow mutants that have been opened before, to stay open when a realtime update comes through
        this.selectedMutantsHaveChanged(changes.get('selectedMutantStates') ?? [])
      ) {
        this.toggleMutant(this.selectedMutant);
      }
    }
    super.update(changes);
  }

  private updateFileRepresentation() {
    this.filters = (['Killed', 'Survived', 'NoCoverage', 'Ignored', 'Timeout', 'CompileError', 'RuntimeError'] satisfies MutantStatus[])
      .filter((status) => this.model.mutants.some((mutant) => mutant.status === status))
      .map((status) => ({
        enabled: [...this.selectedMutantStates, 'Survived', 'NoCoverage', 'Timeout'].includes(status),
        count: this.model.mutants.filter((m) => m.status === status).length,
        status,
        label: html`${getEmojiForStatus(status)} ${status}`,
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
            attributes: {
              class: escapeHtml(`mutant border-none ${mutant.status}`),
              title: escapeHtml(title(mutant)),
              'mutant-id': escapeHtml(mutant.id.toString()),
            },
          };
        }
      }
    });
  }

  private selectedMutantsHaveChanged(changedMutantStates: MutantStatus[]): boolean {
    if (changedMutantStates.length !== this.selectedMutantStates.length) {
      return true;
    }

    return !changedMutantStates.every((state, index) => this.selectedMutantStates[index] === state);
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
