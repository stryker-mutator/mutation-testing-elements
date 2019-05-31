import { MutantResult, Position, FileResult } from 'mutation-testing-report-schema';
import { BackgroundColorCalculator } from './BackgroundColorCalculator';
import { escapeHtml } from './htmlHelpers';

export function pathJoin(...parts: string[]) {
  return parts.reduce((prev, current) => prev.length ? current ? `${prev}/${current}` : prev : current, '');
}

/**
 * Walks over the code in model.source and adds the
 * `<mutation-test-report-mutant>` elements.
 * It also adds the background color using
 * `<span class="bg-danger-light">` and friends.
 */
export function renderCode(model: FileResult): string {
  const backgroundState = new BackgroundColorCalculator();
  const startedMutants: MutantResult[] = [];
  const walker = (char: string, pos: Position): string => {
    const currentMutants = model.mutants.filter(m => eq(m.location.start, pos));
    const mutantsEnding = startedMutants.filter(m => gte(pos, m.location.end));

    // Remove the mutants that ended from the list of mutants that started
    mutantsEnding.forEach(mutant => startedMutants.splice(startedMutants.indexOf(mutant), 1));

    // Add new mutants to started mutants
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
  return `<span>${walkString(model.source, walker)}</span>`;
}

export const COLUMN_START_INDEX = 1;
export const LINE_START_INDEX = 1;
export const NEW_LINE = '\n';
export const CARRIAGE_RETURN = '\r';
export function lines(content: string) {
  return content.split(NEW_LINE)
    .map(line => line.endsWith(CARRIAGE_RETURN) ? line.substr(0, line.length - 1) : line);
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

function gte(a: Position, b: Position) {
  return a.line > b.line || (a.line === b.line && a.column >= b.column);
}

function eq(a: Position, b: Position) {
  return a.line === b.line && a.column === b.column;
}
