import { MutantResult, Position, FileResult } from 'mutation-testing-report-schema';
import { TestModel } from 'mutation-testing-metrics';
import { BackgroundColorCalculator } from './BackgroundColorCalculator';
import { escapeHtml } from './htmlHelpers';

export enum ProgrammingLanguage {
  csharp = 'cs',
  java = 'java',
  javascript = 'javascript',
  html = 'html',
  php = 'php',
  scala = 'scala',
  typescript = 'typescript',
  vue = 'vue',
}

/**
 * Returns the lower case extension without the `.`.
 * @param fileName The file name
 * @returns File extension
 */
export function getExtension(fileName: string): string {
  return fileName.substr(fileName.lastIndexOf('.') + 1).toLocaleLowerCase();
}

/**
 * Determines the programming language based on file extension.
 */
export function determineLanguage(fileName: string): ProgrammingLanguage | undefined {
  switch (getExtension(fileName)) {
    case 'cs':
      return ProgrammingLanguage.csharp;
    case 'html':
      return ProgrammingLanguage.html;
    case 'java':
      return ProgrammingLanguage.java;
    case 'js':
    case 'cjs':
    case 'mjs':
      return ProgrammingLanguage.javascript;
    case 'ts':
    case 'tsx':
      return ProgrammingLanguage.typescript;
    case 'scala':
      return ProgrammingLanguage.scala;
    case 'php':
      return ProgrammingLanguage.php;
    case 'vue':
      return ProgrammingLanguage.vue;
    default:
      return undefined;
  }
}

/**
 * Walks over the code in model.source and adds the
 * `<mte-mutant>` elements.
 * It also adds the background color using
 * `<span class="bg-danger-light">` and friends.
 */
export function markMutants(model: FileResult): string {
  const backgroundState = new BackgroundColorCalculator();
  const startedMutants: MutantResult[] = [];
  const walker = (char: string, pos: Position): string => {
    const currentMutants = model.mutants.filter((m) => eq(m.location.start, pos));
    const mutantsEnding = startedMutants.filter((m) => gte(pos, m.location.end));

    // Remove the mutants that ended from the list of mutants that started
    mutantsEnding.forEach((mutant) => startedMutants.splice(startedMutants.indexOf(mutant), 1));

    // Add new mutants to started mutants
    startedMutants.push(...currentMutants);

    const builder: string[] = [];
    if (currentMutants.length || mutantsEnding.length) {
      currentMutants.forEach(backgroundState.markMutantStart);
      mutantsEnding.forEach(backgroundState.markMutantEnd);

      // End previous color span
      builder.push('</span>');

      // End mutants
      mutantsEnding.forEach(() => builder.push('</mte-mutant>'));

      // Start mutants
      currentMutants.forEach((mutant) => builder.push(`<mte-mutant mutant-id="${mutant.id}">`));

      // Start new color span
      builder.push(`<span class="bg-${backgroundState.determineBackground() || ''}">`);
    }

    // Append the code character
    builder.push(escapeHtml(char));
    return builder.join('');
  };
  return `<span>${walkString(model.source, walker)}</span>`;
}

export function isAlfaNumeric(char: string) {
  // We could use a regex here, but what's the fun in that?
  const alfaNumeric = 'azAZ09';

  const charCode = char.charCodeAt(0);
  const between = (from: number, to: number) => charCode >= alfaNumeric.charCodeAt(from) && charCode <= alfaNumeric.charCodeAt(to);
  return between(0, 1) || between(2, 3) || between(4, 5);
}

export function markTests(source: string, tests: TestModel[]): string {
  const toComponent = (test: TestModel): string => `<mte-test test-id="${test.id}"></mte-test>`;

  // work with a copy, so we can mutate the array
  const testsToPlace = [...tests];
  return `<span>${walkString(source, (char, pos) => {
    const builder: string[] = [];

    // Test columns can be flaky. Let's prevent tests from appearing in the middle of words at least.
    if (!isAlfaNumeric(char)) {
      // Determine the test starts using `gte`. That way, if a flaky line/column results in a non-existing location, it will still appear on the next line
      const startingTests = testsToPlace.filter((test) => test.location && gte(pos, test.location.start));
      builder.push(...startingTests.map(toComponent));

      // Remove the test from the tests to place
      startingTests.forEach((test) => testsToPlace.splice(testsToPlace.indexOf(test), 1));
    }
    builder.push(escapeHtml(char));
    return builder.join('');
  })}${testsToPlace.map(toComponent).join('')}</span>`;
}

export const COLUMN_START_INDEX = 1;
export const LINE_START_INDEX = 1;
export const NEW_LINE = '\n';
export const CARRIAGE_RETURN = '\r';
export function lines(content: string) {
  return content.split(NEW_LINE).map((line) => (line.endsWith(CARRIAGE_RETURN) ? line.substr(0, line.length - 1) : line));
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
