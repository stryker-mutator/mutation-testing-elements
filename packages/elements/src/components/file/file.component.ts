import type { HTMLTemplateResult, PropertyValues } from 'lit';
import { html, nothing, svg, unsafeCSS } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { repeat } from 'lit/directives/repeat.js';
import { when } from 'lit/directives/when.js';
import type { FileUnderTestModel, MutantModel } from 'mutation-testing-metrics';
import type { MutantResult, MutantStatus } from 'mutation-testing-report-schema/api';

import { findDiffIndices, gte, highlightCode, transformHighlightedLines } from '../../lib/code-helpers.js';
import type { MteCustomEvent } from '../../lib/custom-events.js';
import { createCustomEvent } from '../../lib/custom-events.js';
import { escapeHtml, getContextClassForStatus, getEmojiForStatus, scrollToCodeFragmentIfNeeded } from '../../lib/html-helpers.js';
import { prismjs, tailwind } from '../../style/index.js';
import { RealTimeElement } from '../real-time-element.js';
import type { StateFilter } from '../state-filter/state-filter.component.js';
import style from './file.css?inline';
import { beginElementAnimation, circle, renderDots, renderLine, triangle } from './util.js';

const diffOldClass = 'diff-old';
const diffNewClass = 'diff-new';
@customElement('mte-file')
export class FileComponent extends RealTimeElement {
  static styles = [prismjs, tailwind, unsafeCSS(style)];

  @state()
  declare public filters: StateFilter<MutantStatus>[];

  @property({ attribute: false })
  declare public model: FileUnderTestModel;

  @state()
  declare public selectedMutantStates: MutantStatus[];

  @state()
  declare private selectedMutant?: MutantModel;

  @state()
  declare private lines: string[];

  @state()
  declare public mutants: MutantModel[];

  @query('code')
  declare private code: HTMLElement;

  #abortController: AbortController;

  public constructor() {
    super();
    this.filters = [];
    this.selectedMutantStates = [];
    this.lines = [];
    this.mutants = [];
    this.#abortController = new AbortController();
  }

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('keydown', this.#handleKeyDown, { signal: this.#abortController.signal });
  }

  disconnectedCallback(): void {
    this.#abortController.abort();
    super.disconnectedCallback();
  }

  #handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.selectedMutant) {
      this.#toggleMutant(this.selectedMutant);
    }
  };

  readonly #filtersChanged = (event: MteCustomEvent<'filters-changed'>) => {
    // Pending is not filterable, but they should still be shown to the user.
    this.selectedMutantStates = (event.detail as MutantStatus[]).concat(['Pending']);
  };

  #codeClicked = (ev: MouseEvent) => {
    ev.stopPropagation();

    if (ev.target instanceof Element) {
      let maybeMutantTarget: Element | null = ev.target;
      const mutantsInScope: MutantModel[] = [];
      for (; maybeMutantTarget instanceof Element; maybeMutantTarget = maybeMutantTarget.parentElement) {
        const mutantId = maybeMutantTarget.getAttribute('data-mutant-id');
        const mutant = this.mutants.find(({ id }) => id.toString() === mutantId);
        if (mutant) {
          mutantsInScope.push(mutant);
        }
      }
      const index = (this.selectedMutant ? mutantsInScope.indexOf(this.selectedMutant) : -1) + 1;
      if (mutantsInScope[index]) {
        this.#toggleMutant(mutantsInScope[index]);
        clearSelection();
      } else if (this.selectedMutant) {
        this.#toggleMutant(this.selectedMutant);
        clearSelection();
      }
    }
  };

  public render() {
    const mutantLineMap = Map.groupBy(this.mutants, (mutant) => mutant.location.start.line);
    const finalMutants = this.#renderMutantDots(
      Array.from(mutantLineMap.entries())
        .filter(([line]) => line > this.lines.length)
        .flatMap(([, mutants]) => mutants),
    );

    return html`<mte-state-filter
        allow-toggle-all
        .filters=${this.filters}
        @filters-changed=${this.#filtersChanged}
        @next=${this.#nextMutant}
        @previous=${this.#previousMutant}
      ></mte-state-filter>
      <pre
        @click=${this.#codeClicked}
        id="report-code-block"
        class="line-numbers ${this.selectedMutantStates.map((state) => `mte-selected-${state}`).join(' ')} flex rounded-md py-4"
      >
        <code class="flex language-${this.model.language}">
          <table>${map(this.lines, (line, lineIndex) => {
        const lineNr = lineIndex + 1;
        const mutantDots = this.#renderMutantDots(mutantLineMap.get(lineNr));

        return renderLine(line, renderDots(mutantDots, this.lines.length === lineNr ? finalMutants : nothing));
      })}</table>
          </code>
          </pre>`;
  }

  #nextMutant = () => {
    const index = this.selectedMutant ? (this.mutants.indexOf(this.selectedMutant) + 1) % this.mutants.length : 0;
    if (this.mutants[index]) {
      this.#toggleMutant(this.mutants[index]);
    }
  };
  #previousMutant = () => {
    const index = this.selectedMutant
      ? (this.mutants.indexOf(this.selectedMutant) + this.mutants.length - 1) % this.mutants.length
      : this.mutants.length - 1;
    if (this.mutants[index]) {
      this.#toggleMutant(this.mutants[index]);
    }
  };

  #renderMutantDots(mutants: MutantModel[] | undefined): HTMLTemplateResult | typeof nothing {
    return when(
      mutants?.length,
      () =>
        repeat(
          mutants!,
          (mutant) => mutant.id,
          (mutant) =>
            svg`<svg
              data-mutant-id="${mutant.id}"
              class="mutant-dot ${this.selectedMutant?.id === mutant.id ? 'selected' : ''} ${mutant.status} mx-0.5 cursor-pointer"
              height="11"
              width="11"
            >
              <title>${title(mutant)}</title>
              ${this.selectedMutant?.id === mutant.id ? triangle : circle}
            </svg>`,
        ) as HTMLTemplateResult,
      () => nothing,
    );
  }
  #toggleMutant(mutant: MutantModel) {
    this.#removeCurrentDiff();

    // Animate (de)selection
    this.#animateMutantToggle(mutant);

    if (this.selectedMutant === mutant) {
      this.selectedMutant = undefined;
      this.dispatchEvent(createCustomEvent('mutant-selected', { selected: false, mutant }));
      return;
    } else if (this.selectedMutant) {
      // Animate old selected mutant
      this.#animateMutantToggle(this.selectedMutant);
    }

    this.selectedMutant = mutant;
    const lines = this.code.querySelectorAll('tr.line');
    for (let i = mutant.location.start.line - 1; i < mutant.location.end.line; i++) {
      lines.item(i).classList.add(diffOldClass);
    }
    const mutatedLines = this.#highlightedReplacementRows(mutant);
    const mutantEndRow = lines.item(mutant.location.end.line - 1);
    mutantEndRow.insertAdjacentHTML('afterend', mutatedLines);
    scrollToCodeFragmentIfNeeded(mutantEndRow);
    this.dispatchEvent(createCustomEvent('mutant-selected', { selected: true, mutant }));
  }

  #removeCurrentDiff() {
    const code = this.code;
    const oldDiffLines = code.querySelectorAll(`.${diffOldClass}`);
    oldDiffLines.forEach((oldDiffLine) => oldDiffLine.classList.remove(diffOldClass));
    const newDiffLines = code.querySelectorAll(`.${diffNewClass}`);
    newDiffLines.forEach((newDiffLine) => newDiffLine.remove());
  }

  public override reactivate(): void {
    super.reactivate();
    this.#updateFileRepresentation();
  }

  public update(changes: PropertyValues<this>) {
    if (changes.has('model') && this.model) {
      this.#updateFileRepresentation();
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
        this.#selectedMutantsHaveChanged(changes.get('selectedMutantStates') ?? [])
      ) {
        this.#toggleMutant(this.selectedMutant);
      }
    }
    super.update(changes);
  }

  #updateFileRepresentation() {
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
              'data-mutant-id': escapeHtml(mutant.id.toString()),
            },
          };
        }
      }
    });
  }

  #selectedMutantsHaveChanged(changedMutantStates: MutantStatus[]): boolean {
    if (changedMutantStates.length !== this.selectedMutantStates.length) {
      return true;
    }

    return !changedMutantStates.every((state, index) => this.selectedMutantStates[index] === state);
  }

  #highlightedReplacementRows(mutant: MutantModel): string {
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

  #animateMutantToggle(mutant: MutantModel) {
    beginElementAnimation(this.code, 'data-mutant-id', mutant.id);
  }
}

function title(mutant: MutantModel): string {
  return `${mutant.mutatorName} ${mutant.status}`;
}

function clearSelection() {
  window.getSelection()?.removeAllRanges();
}
