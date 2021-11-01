import { MutantResult, Position, FileResult } from 'mutation-testing-report-schema/api';
import { MutantModel, TestFileModel, TestModel } from 'mutation-testing-metrics';
import { BackgroundColorCalculator } from './BackgroundColorCalculator';
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
 * @returns highlighted code with mutants
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

export function highlightedReplacementRows(mutant: MutantModel, language: string): string {
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
    if (!isWhitespace(mutatedLines[focusFrom - 1])) {
      focusFrom--;
    }
  }
  // Include the next char
  focusTo++;

  const lines = transformHighlightedLines(highlight(mutatedLines, languages[language], language), ({ offset }) => {
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
 * @returns highlighted code with mutants
 */
export function highlightedCodeTableWithTests(file: TestFileModel, source: string): string {
  const language = determineLanguage(file.name) ?? 'javascript';
  const highlightedSource = highlight(source, languages[language], language);
  const testsToPlace = [...file.tests];
  const lineStart = '<tr><td class="line-number"></td><td class="line-marker"></td><td class="code">';
  const lineEnd = '</td></tr>';
  const toComponent = (test: TestModel): string => `<mte-test test-id="${test.id}"></mte-test>`;

  const lines = transformHighlightedLines(highlightedSource, (pos) => {
    const char = source[pos.offset];
    // Test columns can be flaky. Let's prevent tests from appearing in the middle of words at least.
    if (!isAlfaNumeric(char)) {
      // Determine the test starts using `gte`. That way, if a flaky line/column results in a non-existing location, it will still appear on the next line
      const startingTests = testsToPlace.filter((test) => test.location && gte(pos, test.location.start));
      // Remove the test from the tests to place
      startingTests.forEach((test) => testsToPlace.splice(testsToPlace.indexOf(test), 1));
      return {
        additionalHtml: startingTests.map(toComponent).join(''),
      };
    }
    return;
  });

  const tableBody = lines.map((line) => `${lineStart}${line}${lineEnd}`).join('');
  return `<table>${tableBody}</table>`;
}

interface VisitResult {
  markerClass?: string | null;
  additionalHtml?: string;
}

interface PositionWithOffset extends Position {
  offset: number;
}

/**
 * Takes in a highlighted source and transforms into individual lines.
 *
 * Example:
 * ```js
 * `<span class="token comment">/* some
 * multiline comment
 * * /</span>
 * <span class="token identifier">foo</token>`
 * ```
 *
 * Becomes:
 * ```js
 * [
 *   '<span class="token comment">/* some</span>',
 *   '<span class="token comment">multiline comment</span>',
 *   '<span class="token comment">* /</span>',
 *   '<span class="token identifier">foo</token>'
 * ]
 * ```
 *
 * It also allows callers to add background coloring spans.
 *
 * It does this by using a _very simple_ and _very limited_ html parser that understands text with span elements, just enough for highlighted html.
 *
 * @param source The highlighted source
 * @param visitor The visitor function that is executed for each position in the source code and allows callers to inject a marker css class
 * @returns the highlighted source split into lines
 */
function transformHighlightedLines(source: string, visitor: (pos: PositionWithOffset) => VisitResult | undefined): string[] {
  let currentLineParts: string[] = [];
  const lines: string[] = [];
  const currentPosition: PositionWithOffset = {
    column: 0, // incremented to 1 before first visitation
    line: 1,
    offset: -1, // incremented to 0 before first visitation
  };

  // class Span {
  //   constructor(public readonly id: string, public readonly raw: string) {}
  // }

  // const currentSpans: Span[] = [];
  let currentCustomMarkerClass: string | null = null;
  let currentHighlightedClass: string | undefined;
  let pos = 0;

  while (pos < source.length) {
    switch (source[pos]) {
      case Characters.CarriageReturn:
        currentPosition.offset++;
        break;
      case Characters.NewLine: // Create a new line
        endLine();
        currentPosition.offset++;
        currentPosition.line++;
        currentPosition.column = 0;
        startMarkers();
        break;
      case Characters.LT: {
        // start of a element
        const { elementName, attributes, isClosing, raw } = parseElement();
        if (elementName === 'span') {
          if (isClosing) {
            currentHighlightedClass = undefined;
          }
          if (attributes.class) {
            currentHighlightedClass = attributes.class;
          }
        }
        emit(raw);
        break;
      }
      case Characters.Amp:
        // Start of an HTML entity
        visitCharacter(parseHtmlEntity());
        break;
      default:
        visitCharacter(source[pos]);
        break;
    }
    pos++;
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

  function visitCharacter(raw: string) {
    currentPosition.column++;
    currentPosition.offset++;
    const visitResult = visitor(currentPosition);
    const customMarkerClass = visitResult?.markerClass;
    const additionalHtml = visitResult?.additionalHtml;
    if (customMarkerClass || customMarkerClass === null) {
      endMarkers();
      currentCustomMarkerClass = customMarkerClass;
      startMarkers();
    }
    if (additionalHtml) {
      emit(additionalHtml);
    }
    emit(raw);
  }

  function parseElement() {
    const startPos = pos;
    if (source[pos] === '<') {
      pos++;
    }
    const isClosing = source[pos] === '/';
    if (isClosing) {
      pos++;
    }
    const elementNameStartPos = pos;
    while (!isWhitespace(source[pos]) && source[pos] !== Characters.GT) {
      pos++;
    }
    const elementName = source.substring(elementNameStartPos, pos);
    const attributes = parseAttributes();
    const raw = source.substring(startPos, pos + 1);
    return { elementName, attributes, isClosing, raw };
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

export function isAlfaNumeric(char: string | undefined): boolean {
  // We could use a regex here, but what's the fun in that?
  if (char) {
    const alfaNumeric = 'azAZ09';

    const charCode = char.charCodeAt(0);
    const between = (from: number, to: number) => charCode >= alfaNumeric.charCodeAt(from) && charCode <= alfaNumeric.charCodeAt(to);
    return between(0, 1) || between(2, 3) || between(4, 5);
  }
  return false;
}

function isWhitespace(char: string) {
  return char === Characters.NewLine || char === Characters.Space || char === Characters.Tab;
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

function gte(a: Position, b: Position) {
  return a.line > b.line || (a.line === b.line && a.column >= b.column);
}
