import { LitElement, html, property, customElement, css, PropertyValues, unsafeCSS } from 'lit-element';
import { FileResult, MutantStatus, MutantResult } from '../../api';
import hljs from 'highlight.js/lib/highlight';
import javascript from 'highlight.js/lib/languages/javascript';
import scala from 'highlight.js/lib/languages/scala';
import java from 'highlight.js/lib/languages/java';
import cs from 'highlight.js/lib/languages/cs';
import typescript from 'highlight.js/lib/languages/typescript';
import { getContextClassForStatus, LINE_START_INDEX, COLUMN_START_INDEX, lines as toLines, escapeHtml, NEW_LINE, CARRIAGE_RETURN } from '../helpers';
import { MutationTestReportMutantComponent } from './mutation-test-report-mutant';
import { MutantFilter } from './mutation-test-report-file-legend';
import { bootstrap, highlightJS } from '../style';
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('cs', cs);
hljs.registerLanguage('java', java);
hljs.registerLanguage('scala', scala);

@customElement('mutation-test-report-file')
export class MutationTestReportFileComponent extends LitElement {

  @property()
  private readonly model!: FileResult;

  public static styles = [
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
    `,
    bootstrap, highlightJS];

  private readonly openAll = () => {
    for (const mutantComponent of this.root.querySelectorAll('mutation-test-report-mutant')) {
      if (mutantComponent instanceof MutationTestReportMutantComponent) {
        mutantComponent.open = true;
      }
    }
  }
  private readonly collapseAll = () => {
    for (const mutantComponent of this.root.querySelectorAll('mutation-test-report-mutant')) {
      if (mutantComponent instanceof MutationTestReportMutantComponent) {
        mutantComponent.open = false;
      }
    }
  }

  private readonly filtersChanged = (event: CustomEvent<MutantFilter[]>) => {
    const enabledMutantStates = event.detail
      .filter(mutantFilter => mutantFilter.enabled)
      .map(mutantFilter => mutantFilter.status);
    for (const mutantComponent of this.root.querySelectorAll('mutation-test-report-mutant')) {
      if (mutantComponent instanceof MutationTestReportMutantComponent) {
        mutantComponent.show = enabledMutantStates.some(state => mutantComponent.status === state);
      }
    }
  }

  public render() {
    return html`
          <mutation-test-report-file-legend @filters-changed="${this.filtersChanged}" @open-all="${this.openAll}" @collapse-all="${this.collapseAll}"
            .mutants="${this.model.mutants}"></mutation-test-report-file-legend>
          <pre><code class="lang-${this.model.language} hljs" .innerHTML="${this.renderCode()}"></code></pre>
        `;
  }

  private get root() {
    return this.shadowRoot || this;
  }

  private renderCode() {
    const code = document.createElement('code');
    code.classList.add(`lang-${this.model.language}`);
    code.innerHTML = this.annotatedCode();
    hljs.highlightBlock(code);
    return code.innerHTML;
  }

  private annotatedCode(): string {

    const lines = toLines(this.model.source);
    const currentCursorMutantStatuses = {
      killed: 0,
      noCoverage: 0,
      survived: 0,
      timeout: 0
    };

    const adjustCurrentMutantResult = (valueToAdd: number) => (mutant: MutantResult) => {
      switch (mutant.status) {
        case MutantStatus.Killed:
          currentCursorMutantStatuses.killed += valueToAdd;
          break;
        case MutantStatus.Survived:
          currentCursorMutantStatuses.survived += valueToAdd;
          break;
        case MutantStatus.Timeout:
          currentCursorMutantStatuses.timeout += valueToAdd;
          break;
        case MutantStatus.NoCoverage:
          currentCursorMutantStatuses.noCoverage += valueToAdd;
          break;
      }
    };

    const determineBackground = () => {
      if (currentCursorMutantStatuses.survived > 0) {
        return getContextClassForStatus(MutantStatus.Survived) + '-light';
      } else if (currentCursorMutantStatuses.noCoverage > 0) {
        return getContextClassForStatus(MutantStatus.NoCoverage) + '-light';
      } else if (currentCursorMutantStatuses.timeout > 0) {
        return getContextClassForStatus(MutantStatus.Timeout) + '-light';
      } else if (currentCursorMutantStatuses.killed > 0) {
        return getContextClassForStatus(MutantStatus.Killed) + '-light';
      }
      return null;
    };

    const annotateCharacter = (char: string, line: number, column: number): string => {
      const mutantsStarting = this.model.mutants.filter(m => m.location.start.line === line && m.location.start.column === column);
      const mutantsEnding = this.model.mutants.filter(m => m.location.end.line === line && m.location.end.column === column);
      mutantsStarting.forEach(adjustCurrentMutantResult(1));
      mutantsEnding.forEach(adjustCurrentMutantResult(-1));
      const isStart = line === LINE_START_INDEX && column === COLUMN_START_INDEX;
      const isEnd = line === lines.length + LINE_START_INDEX - 1 && column === lines[line - LINE_START_INDEX].length + COLUMN_START_INDEX - 1;
      const backgroundColorAnnotation = mutantsStarting.length || mutantsEnding.length || isStart ? `<span class="bg-${determineBackground()}">` : '';
      const backgroundColorEndAnnotation = ((mutantsStarting.length || mutantsEnding.length) && !isStart) || isEnd ? '</span>' : '';
      const mutantsAnnotations = mutantsStarting.map(m =>
        `<mutation-test-report-mutant mutantId="${m.id}" mutatorName="${m.mutatorName}" replacement="${m.replacement}" status="${m.status}">`);
      const originalCodeEndAnnotations = mutantsEnding.map(() => `</mutation-test-report-mutant>`);
      return `${backgroundColorEndAnnotation}${originalCodeEndAnnotations.join('')}${mutantsAnnotations.join('')}${backgroundColorAnnotation}${escapeHtml(char)}`;
    };

    return walkString(this.model.source, annotateCharacter);
  }
}

/**
 * Walks a string. Executes a function on each character of the string (except for new lines and carriage returns)
 * @param source the string to walk
 * @param fn The function to execute on each character of the string
 */
function walkString(source: string, fn: (char: string, line: number, column: number) => string): string {
  const results: string[] = [];
  let column = COLUMN_START_INDEX;
  let row = LINE_START_INDEX;

  for (let i = 0; i < source.length; i++) { // tslint:disable-line:prefer-for-of
    if (column === COLUMN_START_INDEX && source[i] === CARRIAGE_RETURN) {
      continue;
    }
    if (source[i] === NEW_LINE) {
      row++;
      column = COLUMN_START_INDEX;
      results.push(NEW_LINE);
      continue;
    }
    results.push(fn(source[i], row, column++));
  }
  return results.join('');
}
