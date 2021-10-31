import { MutantResult, Position, FileResult } from 'mutation-testing-report-schema/api';
import { MutantModel, TestModel } from 'mutation-testing-metrics';
import { BackgroundColorCalculator } from './BackgroundColorCalculator';
import { escapeHtml } from './htmlHelpers';
import { highlight, languages } from 'prismjs/components/prism-core';

export enum ProgrammingLanguage {
  csharp = 'cs',
  java = 'java',
  javascript = 'javascript',
  html = 'html',
  php = 'php',
  scala = 'scala',
  typescript = 'typescript',
  vue = 'vue',
  gherkin = 'gherkin',
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
    case 'feature':
      return ProgrammingLanguage.gherkin;
    default:
      return undefined;
  }
}

/**
 * Hightlights the code and inserts the mutants as `<mte-mutant>` elements.
 * Code will be inside an html table that looks like this:
 *
 * ```html
 * <table>
 *   <tr>
 *     <td class="line-number"></td>
 *     <td class="line-marker"></td>
 *     <td class="code"> highlighted code</td>
 *   </tr>
 * </table>
 * ```
 *
 * @param model The file result
 * @returns highlighted code with mutant
 */
export function highlightedCodeTableWithMutants(model: FileResult): string {
  const highlightedSource = highlight(model.source, languages[model.language], model.language);
  const startedMutants = new Set<MutantResult>();
  const mutantsToPlace = new Set(model.mutants);
  const backgroundColorCalculator = new BackgroundColorCalculator();
  const lineStart = '<tr><td class="line-number"></td><td class="line-marker"></td><td class="code">';
  const lineEnd = '</td></tr>';

  const lines = transformHighlightedLines(highlightedSource, (position) => {
    let colorChanged = false;
    for (const mutant of startedMutants) {
      if (gte(position, mutant.location.end)) {
        backgroundColorCalculator.markMutantEnd(mutant);
        startedMutants.delete(mutant);
        colorChanged = true;
      }
    }
    for (const mutant of mutantsToPlace) {
      if (gte(position, mutant.location.start)) {
        backgroundColorCalculator.markMutantStart(mutant);
        startedMutants.add(mutant);
        mutantsToPlace.delete(mutant);
        colorChanged = true;
      }
    }
    if (colorChanged) {
      return {
        markerClass: backgroundColorCalculator.determineBackground(),
      };
    }
    return;
  });
  function emitMutants(lineNr: number) {
    return model.mutants
      .filter((mutant) => mutant.location.start.line === lineNr + 1)
      .map((mutant) => `<mte-mutant mutant-id="${mutant.id}"></mte-mutant>`)
      .join('');
  }
  const tableBody = lines.map((line, lineNr) => `${lineStart}${line}${emitMutants(lineNr)}${lineEnd}`).join('');
  return `<table>${tableBody}</table>`;
}

export function highlightReplacement(mutant: MutantModel, language: string): string {
  const mutatedLines = mutant.getMutatedLines().trimEnd();
  const originalLines = mutant.getOriginalLines().trimEnd();

  let focusFrom = 0,
    focusTo = mutatedLines.length - 1;
  while (originalLines[focusFrom] === mutatedLines[focusFrom] && focusFrom < mutatedLines.length) {
    focusFrom++;
  }
  const lengthDiff = originalLines.length - mutatedLines.length;
  while (originalLines[focusTo + lengthDiff] === mutatedLines[focusTo] && focusTo > focusFrom) {
    focusTo--;
  }
  if (focusTo === focusFrom) {
    // For example '""'
    focusFrom--;
  }
  focusTo++;
  const lines = transformHighlightedLines(highlight(mutatedLines, languages[language], language), (pos) => {
    const offset = pos.column - 1;
    if (offset === focusFrom) {
      return { markerClass: 'diff-focus' };
    } else if (offset === focusTo) {
      return { markerClass: null };
    }
    return;
  });
  const lineStart = '<tr class="diff-new"><td class="empty-line-number"></td><td class="line-marker"></td><td>';
  const lineEnd = '</td></tr>';
  return lines.map((line) => `${lineStart}${line}${lineEnd}`).join('');
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

      // Start mutants
      currentMutants.forEach((mutant) => builder.push(`<mte-mutant mutant-id="${mutant.id}"></mte-mutant>`));

      // Start new color span
      builder.push(`<span class="bg-${backgroundState.determineBackground() ?? ''}">`);
    }

    // Append the code character
    builder.push(escapeHtml(char));
    return builder.join('');
  };
  const onNewLine = () => {
    // End previous color span
    // End previous line span
    // Start line span
    // Start new color span
    return `</span></span><span class="mte-line"><span class="bg-${backgroundState.determineBackground() ?? ''}">`;
  };

  const html = `<span><span>${walkString(model.source, walker, onNewLine)}</span></span>`;
  return html;
}

interface TransformIntervention {
  markerClass?: string | null;
}

/**
 *
 * @param source The highlighted source
 * @param fn The function to execute
 * @returns the highlighted source split into lines
 */
function transformHighlightedLines(source: string, fn: (pos: Position) => TransformIntervention | undefined): string[] {
  let currentLineParts: string[] = [];
  const lines: string[] = [];
  const currentPosition: Position = {
    column: 0,
    line: 1,
  };
  let currentCustomMarkerClass: string | null = null;
  let currentHighlightedClass: string | undefined;
  let pos = 0;

  for (pos = 0; pos < source.length; pos++) {
    switch (source[pos]) {
      case Characters.CarriageReturn:
        break;
      case Characters.NewLine: // Create a new line
        endLine();
        currentPosition.line++;
        currentPosition.column = 0;
        startMarkers();
        break;
      case Characters.LT: // start of a element
        {
          const startPos = pos;
          const { elementName, attributes, isClosing } = parseElement();
          if (elementName === 'span') {
            if (isClosing) {
              currentHighlightedClass = undefined;
            }
            if (attributes.class) {
              currentHighlightedClass = attributes.class;
            }
          }
          emit(source.substring(startPos, pos + 1));
        }
        break;
      case Characters.Amp: // Start of an HTML entity (&amp;)
        movePosition();
        emit(parseHtmlEntity());
        break;
      default:
        movePosition();
        emit(source[pos]);
        break;
    }
  }
  endLine();
  return lines;

  function emit(...parts: string[]) {
    currentLineParts.push(...parts);
  }

  function startMarkers() {
    if (currentCustomMarkerClass) {
      emit(`<span class="${currentCustomMarkerClass}">`);
    }
    if (currentHighlightedClass) {
      emit(`<span class="${currentHighlightedClass}">`);
    }
  }

  function endMarkers() {
    if (currentCustomMarkerClass) {
      emit('</span>');
    }
    if (currentHighlightedClass) {
      emit('</span>');
    }
  }

  function endLine() {
    endMarkers();
    lines.push(currentLineParts.join(''));
    currentLineParts = [];
  }

  function movePosition() {
    currentPosition.column++;
    const customMarkerClass = fn(currentPosition)?.markerClass;
    if (customMarkerClass || customMarkerClass === null) {
      endMarkers();
      currentCustomMarkerClass = customMarkerClass;
      startMarkers();
    }
  }

  function isWhitespace(char: string) {
    return char === Characters.NewLine || char === Characters.Space || char === Characters.Tab;
  }

  function parseElement() {
    if (source[pos] === '<') {
      pos++;
    }
    let isClosing = false;
    if (source[pos] === '/') {
      isClosing = true;
      pos++;
    }
    const startPos = pos;
    while (!isWhitespace(source[pos]) && source[pos] !== Characters.GT && pos < source.length) {
      pos++;
    }
    const elementName = source.substring(startPos, pos);
    const attributes = parseAttributes();
    return { elementName, attributes, isClosing };
  }

  function parseAttributes() {
    const attributes: Record<string, string> = Object.create(null);
    while (pos < source.length) {
      const char = source[pos];
      if (char === Characters.GT) {
        return attributes;
      } else if (!isWhitespace(char)) {
        const { name, value } = parseAttribute();
        attributes[name] = value;
      }
      pos++;
    }
    throw new Error('Parse attributes error');
  }

  function parseAttribute() {
    const startPos = pos;
    while (source[pos] !== '=') {
      pos++;
    }
    const name = source.substring(startPos, pos);
    pos++; // jump over '='
    const value = parseAttributeValue();
    return { name, value };
  }

  function parseAttributeValue() {
    if (source[pos] === '"') {
      pos++;
    }
    const startPos = pos;
    while (source[pos] !== '"') {
      pos++;
    }
    return source.substring(startPos, pos);
  }

  function parseHtmlEntity() {
    const startPos = pos;
    while (source[pos] !== Characters.Semicolon) {
      pos++;
    }
    return source.substring(startPos, pos + 1);
  }
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
enum Characters {
  CarriageReturn = '\r',
  NewLine = '\n',
  Space = ' ',
  Amp = '&',
  Semicolon = ';',
  LT = '<',
  GT = '>',
  Tab = '\t',
}
export function lines(content: string) {
  return content.split(Characters.NewLine).map((line) => (line.endsWith(Characters.CarriageReturn) ? line.substr(0, line.length - 1) : line));
}

/**
 * Walks a string. Executes a function on each character of the string (except for new lines and carriage returns)
 * @param source the string to walk
 * @param fn The function to execute on each character of the string
 */
function walkString(source: string, fn: (char: string, position: Position) => string, fnNewLine: () => string = () => ''): string {
  let column = COLUMN_START_INDEX;
  let line = LINE_START_INDEX;
  const builder: string[] = [fnNewLine()];

  for (const currentChar of source) {
    if (column === COLUMN_START_INDEX && currentChar === Characters.CarriageReturn) {
      continue;
    }
    if (currentChar === Characters.NewLine) {
      line++;
      column = COLUMN_START_INDEX;
      // builder.push(NEW_LINE);
      builder.push(fnNewLine());
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
