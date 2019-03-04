import { MutantStatus, FileResultDictionary, MutantResult, Position } from 'mutation-testing-report-schema';
import { FileResultModel } from '../model';

export const ROOT_NAME = 'All files';
const SEPARATOR = '/';

export function getContextClassForStatus(status: MutantStatus) {
  switch (status) {
    case MutantStatus.Killed:
      return 'success';
    case MutantStatus.NoCoverage:
    case MutantStatus.Survived:
      return 'danger';
    case MutantStatus.Timeout:
      return 'warning';
    case MutantStatus.RuntimeError:
    case MutantStatus.CompileError:
      return 'secondary';
  }
}

export const COLUMN_START_INDEX = 1;
export const LINE_START_INDEX = 1;
export const NEW_LINE = '\n';
export const CARRIAGE_RETURN = '\r';
export function lines(content: string) {
  return content.split(NEW_LINE)
    .map(line => line.endsWith(CARRIAGE_RETURN) ? line.substr(0, line.length - 1) : line);
}

export function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function flatMap<T, R>(source: T[], fn: (input: T) => R[]) {
  const result: R[] = [];
  source.map(fn).forEach(items => result.push(...items));
  return result;
}

export function pathJoin(...parts: string[]) {
  return parts.reduce((prev, current) => prev.length ? current ? `${prev}/${current}` : prev : current, '');
}

export function normalizeFileNames(input: FileResultDictionary): FileResultDictionary {
  const fileNames = Object.keys(input);
  const commonBasePath = determineCommonBasePath(fileNames);
  const output: FileResultDictionary = {};
  fileNames.forEach(fileName => {
    output[normalize(fileName.substr(commonBasePath.length))] = input[fileName];
  });
  return output;
}

function normalize(fileName: string) {
  return fileName.split(/\/|\\/)
    .filter(pathPart => pathPart)
    .join('/');
}

export function determineCommonBasePath(fileNames: ReadonlyArray<string>) {
  const directories = fileNames.map(fileName => fileName.split(/\/|\\/).slice(0, -1));

  if (directories.length) {
    return directories.reduce(filterDirectories).join(SEPARATOR);
  } else {
    return '';
  }
}

function filterDirectories(previousDirectories: string[], currentDirectories: string[]) {
  for (let i = 0; i < previousDirectories.length; i++) {
    if (previousDirectories[i] !== currentDirectories[i]) {
      return previousDirectories.splice(0, i);
    }
  }

  return previousDirectories;
}

/**
 * Walks over the code in this.model.source and adds the
 * `<mutation-test-report-mutant>` elements.
 * It also adds the background color using
 * `<span class="bg-danger-light">` and friends.
 */
export function renderCode(model: FileResultModel): string {
  const backgroundState = new BackgroundColorCalculator();
  const startedMutants: MutantResult[] = [];
  const walker = (char: string, pos: Position): string => {
    const currentMutants = model.mutants.filter(m => eq(m.location.start, pos));
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
  return `<span>${walkString(model.source, walker)}</span>`;
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
