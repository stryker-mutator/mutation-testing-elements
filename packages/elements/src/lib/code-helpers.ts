import { Position } from 'mutation-testing-report-schema/api';
import { TestFileModel, TestModel } from 'mutation-testing-metrics';
import { highlight, languages } from 'prismjs/components/prism-core';

const lineStart = '<tr class="line"><td class="line-number"></td><td class="line-marker"></td><td class="code">';
const lineEnd = '</td></tr>';

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

export function highlightCode(code: string, fileName: string): string {
  console.log('highlighting code');
  const language = determineLanguage(fileName) ?? '';
  return highlight(code, languages[language], language);
}

/**
 * Hightlights the code and inserts the mutants as `<mte-mutant>` elements.
 * Code will be inside an html table that looks like this:
 *
 * ```html
 * <table>
 *   <tr class="line-number">
 *     <td></td>
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
  const toOpenAndClosingTags = (test: TestModel): HtmlTag[] => [
    { elementName: 'mte-test', attributes: { 'test-id': test.id } },
    { elementName: 'mte-test', attributes: {}, isClosing: true },
  ];

  const lines = transformHighlightedLines(highlightedSource, (pos) => {
    const char = source[pos.offset];
    // Test columns can be flaky. Let's prevent tests from appearing in the middle of words at least.
    if (!isAlfaNumeric(char)) {
      // Determine the test starts using `gte`. That way, if a flaky line/column results in a non-existing location, it will still appear on the next line
      const startingTests = testsToPlace.filter((test) => test.location && gte(pos, test.location.start));
      // Remove the test from the tests to place
      startingTests.forEach((test) => testsToPlace.splice(testsToPlace.indexOf(test), 1));
      return {
        tags: startingTests.flatMap(toOpenAndClosingTags),
      };
    }
    return;
  });

  const tableBody = lines.map((line) => `${lineStart}${line}${lineEnd}`).join('');
  return `<table>${tableBody}</table>`;
}

interface VisitResult {
  tags: HtmlTag[];
}

interface PositionWithOffset extends Position {
  offset: number;
}

/**
 * A simple HTML tag representation
 */
export interface HtmlTag {
  id?: string;
  elementName: string;
  attributes?: Record<string, string>;
  isClosing?: true;
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
export function transformHighlightedLines(source: string, visitor: (pos: PositionWithOffset) => VisitResult | undefined): string[] {
  let currentLineParts: string[] = [];
  const lines: string[] = [];
  const currentPosition: PositionWithOffset = {
    column: 0, // incremented to 1 before first visitation
    line: 1,
    offset: -1, // incremented to 0 before first visitation
  };

  const currentlyActiveTags: HtmlTag[] = [];
  let tagsNeedOpening = false;
  let pos = 0;

  while (pos < source.length) {
    if (tagsNeedOpening && !isWhitespace(source[pos])) {
      reopenActiveTags();
      tagsNeedOpening = false;
    }
    switch (source[pos]) {
      case Characters.CarriageReturn:
        currentPosition.offset++;
        break;
      case Characters.NewLine:
        endLine();
        currentPosition.offset++;
        currentPosition.line++;
        currentPosition.column = 0;
        tagsNeedOpening = true; // delay opening of the tags to prevent underlined whitespace
        break;
      case Characters.LT: {
        const tag = parseTag();
        if (tag.isClosing) {
          closeTag(tag);
        } else {
          openTag(tag);
        }
        break;
      }
      case Characters.Amp:
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

  function reopenActiveTags() {
    currentlyActiveTags.forEach((tag) => emit(printTag(tag)));
  }

  function closeActiveTags() {
    currentlyActiveTags.forEach((tag) => emit(printTag({ ...tag, isClosing: true })));
  }

  function printTag({ attributes, elementName, isClosing }: HtmlTag) {
    if (isClosing) {
      return `</${elementName}>`;
    }
    return `<${elementName}${Object.entries(attributes ?? {}).reduce((acc, [name, value]) => (value ? `${acc} ${name}="${value}"` : acc), '')}>`;
  }

  function endLine() {
    closeActiveTags();
    lines.push(currentLineParts.join(''));
    currentLineParts = [];
  }

  function visitCharacter(raw: string) {
    currentPosition.column++;
    currentPosition.offset++;
    const visitResult = visitor(currentPosition);
    visitResult?.tags.forEach((tag) => {
      if (tag.isClosing) {
        closeTag(tag);
      } else {
        emit(printTag(tag));
        currentlyActiveTags.push(tag);
      }
    });
    emit(raw);
  }

  function parseTag(): HtmlTag {
    if (source[pos] === '<') {
      pos++;
    }
    const isClosing = source[pos] === '/' ? true : undefined;
    if (isClosing) {
      pos++;
    }
    const elementNameStartPos = pos;
    while (!isWhitespace(source[pos]) && source[pos] !== Characters.GT) {
      pos++;
    }
    const elementName = source.substring(elementNameStartPos, pos);
    const attributes = parseAttributes();
    return { elementName, attributes, isClosing };
  }

  function openTag(tag: HtmlTag) {
    currentlyActiveTags.push(tag);
    emit(printTag(tag));
  }

  function closeTag(tag: HtmlTag) {
    // Closing tags can come in out-of-order
    // which means we need to close opened tags and reopen them.
    for (let tagIndex = currentlyActiveTags.length - 1; tagIndex >= 0; tagIndex--) {
      const activeTag = currentlyActiveTags[tagIndex];

      if (tag.elementName === activeTag.elementName && activeTag.id === tag.id) {
        // We need to close this tag
        emit(printTag(tag));

        // Remove from currently active tags
        currentlyActiveTags.splice(tagIndex, 1);

        // And re-open previously closed tags
        for (let i = tagIndex; i < currentlyActiveTags.length; i++) {
          emit(printTag(currentlyActiveTags[i]));
        }

        // Done
        break;
      }

      // Close this active tag, this isn't the tag we're looking for
      // Will get reopened after we've closed the tag we're looking for
      emit(printTag({ ...activeTag, isClosing: true }));

      // If we're at the last tag, throw an error useful for debugging (this shouldn't happen)
      if (tagIndex === 0) {
        throw new Error(`Cannot find corresponding opening tag for ${printTag(tag)}`);
      }
    }
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

export function isWhitespace(char: string) {
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

export function gte(a: Position, b: Position) {
  return a.line > b.line || (a.line === b.line && a.column >= b.column);
}
