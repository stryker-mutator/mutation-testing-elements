import { LitElement, html, property, customElement, css, PropertyValues } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import hljs from 'highlight.js/lib/highlight';
import javascript from 'highlight.js/lib/languages/javascript';
import scala from 'highlight.js/lib/languages/scala';
import java from 'highlight.js/lib/languages/java';
import cs from 'highlight.js/lib/languages/cs';
import typescript from 'highlight.js/lib/languages/typescript';
import { getContextClassForStatus, LINE_START_INDEX, COLUMN_START_INDEX, escapeHtml, NEW_LINE, CARRIAGE_RETURN } from '../helpers';
import { MutationTestReportMutantComponent } from './mutation-test-report-mutant';
import { MutantFilter } from './mutation-test-report-file-legend';
import { bootstrap, highlightJS } from '../style';
import { ResultTable } from '../model/ResultTable';
import { FileResult, MutantStatus, MutantResult, Thresholds, Position } from 'mutation-testing-report-schema';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('cs', cs);
hljs.registerLanguage('java', java);
hljs.registerLanguage('scala', scala);

@customElement('mutation-test-report-file')
export class MutationTestReportFileComponent extends LitElement {

  @property()
  private readonly model!: FileResult;

  @property()
  private readonly name!: string;

  @property()
  private readonly thresholds!: Thresholds;

  private enabledMutantStates: MutantStatus[] = [];

  public static styles = [
    highlightJS,
    bootstrap,
    css`
    .bg-danger-light {
      background-color: #f2dede;
    }
    .bg-success-light {
        background-color: #dff0d8;
    }
    .bg-warning-light {
        background-color: #fcf8e3;
    }
    `];

  private readonly openAll = () => {
    this.forEachMutantComponent(mutantComponent => mutantComponent.expand = true);
  }
  private readonly collapseAll = () => {
    this.forEachMutantComponent(mutantComponent => mutantComponent.expand = false);
  }

  private forEachMutantComponent(action: (mutant: MutationTestReportMutantComponent) => void, host = this.root) {
    for (const mutantComponent of host.querySelectorAll('mutation-test-report-mutant')) {
      if (mutantComponent instanceof MutationTestReportMutantComponent) {
        action(mutantComponent);
      }
    }
  }

  private readonly filtersChanged = (event: CustomEvent<MutantFilter[]>) => {
    this.enabledMutantStates = event.detail
      .filter(mutantFilter => mutantFilter.enabled)
      .map(mutantFilter => mutantFilter.status);
    this.updateShownMutants();
  }

  private updateShownMutants() {
    this.forEachMutantComponent(mutantComponent => {
      mutantComponent.show = this.enabledMutantStates.some(state => mutantComponent.mutant !== undefined && mutantComponent.mutant.status === state);
    });
  }

  public render() {
    return html`
        <div class="row">
          <div class="totals col-sm-11">
            <mutation-test-report-totals .model="${ResultTable.forFile(this.name, this.model, this.thresholds)}"></mutation-test-report-totals>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <mutation-test-report-file-legend @filters-changed="${this.filtersChanged}" @open-all="${this.openAll}"
              @collapse-all="${this.collapseAll}" .mutants="${this.model.mutants}"></mutation-test-report-file-legend>
            <pre><code class="lang-${this.model.language} hljs">${unsafeHTML(this.renderCode())}</code></pre>
          </div>
        </div>
        `;
  }

  public firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    const code = this.root.querySelector('code');
    if (code) {
      hljs.highlightBlock(code);
      this.forEachMutantComponent(mutantComponent => {
        mutantComponent.mutant = this.model.mutants.find(mutant => mutant.id.toString() === mutantComponent.getAttribute('mutant-id'));
      }, code);
    }
  }

  private get root(): ParentNode {
    return this.shadowRoot || this;
  }

  /**
   * Walks over the code in this.model.source and adds the
   * `<mutation-test-report-mutant>` elements.
   * It also adds the background color using
   * `<span class="bg-danger-light">` and friends.
   */
  private renderCode(): string {
    const backgroundState = new BackgroundColorCalculator();
    const startedMutants: MutantResult[] = [];
    const walker = (char: string, pos: Position): string => {
      const currentMutants = this.model.mutants.filter(m => eq(m.location.start, pos));
      const mutantsEnding = startedMutants.filter(m => gte(pos, m.location.end));
      mutantsEnding.forEach(mutant => startedMutants.splice(startedMutants.indexOf(mutant), 1));
      startedMutants.push(...currentMutants);
      const builder: string[] = [];
      if (currentMutants.length || mutantsEnding.length) {
        currentMutants.forEach(backgroundState.markMutantStart);
        mutantsEnding.forEach(backgroundState.markMutantEnd);

        // End previous color span
        builder.push('</span>');

        // End mutants
        mutantsEnding.forEach(() => builder.push('</mutation-test-report-mutant>'));

        // Start mutants
        currentMutants.forEach(mutant => builder.push(`<mutation-test-report-mutant mutant-id="${mutant.id}">`));

        // Start new color span
        builder.push(`<span class="bg-${backgroundState.determineBackground()}">`);
      }

      // Append the code character
      builder.push(escapeHtml(char));
      return builder.join('');
    };
    return `<span>${walkString(this.model.source, walker)}</span>`;
  }
}

/**
 * Walks a string. Executes a function on each character of the string (except for new lines and carriage returns)
 * @param source the string to walk
 * @param fn The function to execute on each character of the string
 */
function walkString(source: string, fn: (char: string, position: Position) => string): string {
  let column = COLUMN_START_INDEX;
  let line = LINE_START_INDEX;
  const builder: string[] = [];

  for (const currentChar of source) {
    if (column === COLUMN_START_INDEX && currentChar === CARRIAGE_RETURN) {
      continue;
    }
    if (currentChar === NEW_LINE) {
      line++;
      column = COLUMN_START_INDEX;
      builder.push(NEW_LINE);
      continue;
    }
    builder.push(fn(currentChar, { line, column: column++ }));
  }
  return builder.join('');
}

/**
 * Class to keep track of the states of the
 * mutants that are active at the cursor while walking the code.
 */
class BackgroundColorCalculator {
  private killed = 0;
  private noCoverage = 0;
  private survived = 0;
  private timeout = 0;

  public readonly markMutantStart = (mutant: MutantResult) => {
    this.countMutant(1, mutant.status);
  }

  public readonly markMutantEnd = (mutant: MutantResult) => {
    this.countMutant(-1, mutant.status);
  }

  private countMutant(valueToAdd: number, status: MutantStatus) {
    switch (status) {
      case MutantStatus.Killed:
        this.killed += valueToAdd;
        break;
      case MutantStatus.Survived:
        this.survived += valueToAdd;
        break;
      case MutantStatus.Timeout:
        this.timeout += valueToAdd;
        break;
      case MutantStatus.NoCoverage:
        this.noCoverage += valueToAdd;
        break;
    }
  }

  public determineBackground = () => {
    if (this.survived > 0) {
      return getContextClassForStatus(MutantStatus.Survived) + '-light';
    } else if (this.noCoverage > 0) {
      return getContextClassForStatus(MutantStatus.NoCoverage) + '-light';
    } else if (this.timeout > 0) {
      return getContextClassForStatus(MutantStatus.Timeout) + '-light';
    } else if (this.killed > 0) {
      return getContextClassForStatus(MutantStatus.Killed) + '-light';
    }
    return null;
  }
}

function gte(a: Position, b: Position) {
  return a.line > b.line || (a.line === b.line && a.column >= b.column);
}

function eq(a: Position, b: Position) {
  return a.line === b.line && a.column === b.column;
}
