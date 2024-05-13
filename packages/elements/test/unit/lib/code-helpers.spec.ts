import type { PositionWithOffset } from '../../../src/lib/code-helpers.js';
import { determineLanguage, transformHighlightedLines, ProgrammingLanguage, findDiffIndices, highlightCode } from '../../../src/lib/code-helpers.js';
import * as prism from 'prismjs/components/prism-core';

describe(highlightCode.name, () => {
  it.each([
    ['foo.cs', ProgrammingLanguage.csharp, 'using System;'],
    ['foo.java', ProgrammingLanguage.java, 'import java.lang;'],
    ['foo.ts', ProgrammingLanguage.typescript, 'const foo = bar;'],
    ['foo.tsx', ProgrammingLanguage.typescript, 'const foo = bar;'],
    ['foo.cts', ProgrammingLanguage.typescript, 'const foo = bar;'],
    ['foo.mts', ProgrammingLanguage.typescript, 'const foo = bar;'],
    ['foo.js', ProgrammingLanguage.javascript, 'const foo = bar;'],
    ['foo.cjs', ProgrammingLanguage.javascript, 'const foo = bar;'],
    ['foo.mjs', ProgrammingLanguage.javascript, 'const foo = bar;'],
    ['foo.php', ProgrammingLanguage.php, '$foo = $bar;'],
    ['foo.html', ProgrammingLanguage.html, '<html></html>'],
    ['foo.vue', ProgrammingLanguage.html, '<script>Vue.component({})</script>'],
    ['foo.feature', ProgrammingLanguage.gherkin, 'Feature: foo'],
    ['foo.scala', ProgrammingLanguage.scala, 'object Foo { def main(args: Array[String]) = println("Hello, world!") }'],
    ['foo.rs', ProgrammingLanguage.rust, 'fn main() { println!("Hello, world!"); }'],
  ])(`should parse %s as %s`, (fileName, language, code) => {
    const highlightSpy = vi.spyOn(prism, 'highlight');
    const highlightedCode = highlightCode(code, fileName);
    expect(highlightedCode).contains('<span'); // actual highlighting is not tested, in prism we trust
    expect(highlightSpy).toHaveBeenCalledWith(code, prism.languages[language], language);
  });

  it('should at least sanitize an unknown language', () => {
    const highlightSpy = vi.spyOn(prism, 'highlight');
    const highlightedCode = highlightCode('const a = \'<script>alert("a")</script>\'; b & a', 'foo.bar');
    expect(highlightedCode).eq('const a = \'&lt;script>alert("a")&lt;/script>\'; b &amp; a');
    expect(highlightSpy).toHaveBeenCalled();
  });
});

describe(transformHighlightedLines.name, () => {
  it('should split a span on multiple lines', () => {
    const input = '<span class="comment">/*\nfoo\n*/</span>';

    const lines = transformHighlightedLines(input);
    expect(lines).deep.eq(['<span class="comment">/*</span>', '<span class="comment">foo</span>', '<span class="comment">*/</span>']);
  });

  it('should support splitting multiple spans on multiple lines', () => {
    const input = '<span class="comment">/*\n<span class="token">foo\n*/</span></span>';

    const lines = transformHighlightedLines(input);
    expect(lines).deep.eq([
      '<span class="comment">/*</span>',
      '<span class="comment"><span class="token">foo</span></span>',
      '<span class="comment"><span class="token">*/</span></span>',
    ]);
  });

  describe('visitor position', () => {
    let positions: PositionWithOffset[];
    const collectPositions = (pos: PositionWithOffset) => {
      positions.push({ ...pos });
      return [];
    };

    function produceLinePositions(startOffset: number, line: number, toColumnIncl: number) {
      const results: PositionWithOffset[] = [];
      for (let i = 1; i <= toColumnIncl; i++) {
        results.push({ column: i, line, offset: startOffset++ });
      }
      return results;
    }

    beforeEach(() => {
      positions = [];
    });

    it('start with column 1, line 1, offset 0', () => {
      transformHighlightedLines('const foo = bar', collectPositions);
      const expectedPosition: PositionWithOffset = { column: 1, line: 1, offset: 0 };

      expect(positions[0]).deep.eq(expectedPosition);
    });

    it('should skip html tags', () => {
      transformHighlightedLines('const <span \nclass="token">foo</span> = bar', collectPositions);
      expect(positions).deep.eq(produceLinePositions(0, 1, 15));
    });

    it('should skip html entities', () => {
      transformHighlightedLines('foo &amp; bar', collectPositions);
      expect(positions).deep.eq(produceLinePositions(0, 1, 9));
    });

    it('should skip carriage returns', () => {
      transformHighlightedLines('foo\r\nbar\r\n', collectPositions);
      expect(positions).deep.eq([...produceLinePositions(0, 1, 3), ...produceLinePositions(5, 2, 3)]);
    });
  });

  describe('visitor html tag insertion', () => {
    it('should allow a simple html tag to be inserted', () => {
      const result = transformHighlightedLines('const foo = bar', function* ({ offset }) {
        if (offset === 6) {
          yield { elementName: 'span', attributes: { class: 'token' } };
        }
        if (offset === 9) {
          yield { elementName: 'span', isClosing: true };
        }
      });
      expect(result).deep.eq(['const <span class="token">foo</span> = bar']);
    });
    it('should allow an inserted html tag to span multiple lines', () => {
      const result = transformHighlightedLines('const foo\n = bar', function* ({ offset }) {
        if (offset === 6) {
          yield { elementName: 'span', attributes: { class: 'token' } };
        }
        if (offset === 16) {
          yield { elementName: 'span', isClosing: true };
        }
      });
      expect(result).deep.eq(['const <span class="token">foo</span>', ' <span class="token">= bar</span>']);
    });
    it('should allow inserted html tags to be closed out-of-order using the id', () => {
      const result = transformHighlightedLines('<span class="token">const foo</span>\n = bar', function* ({ offset }) {
        if (offset === 5) {
          yield { elementName: 'span', id: '1', attributes: { class: 'mutant1' } };
        }
        if (offset === 6) {
          yield { elementName: 'span', id: '2', attributes: { class: 'mutant2' } };
        }
        if (offset === 14) {
          yield { elementName: 'span', id: '1', isClosing: true };
        }
        if (offset === 15) {
          yield { elementName: 'span', id: '2', isClosing: true };
        }
      });
      expect(result).deep.eq([
        '<span class="token">const<span class="mutant1"> <span class="mutant2">foo</span></span></span><span class="mutant1"><span class="mutant2"></span></span>',
        ' <span class="mutant1"><span class="mutant2">= b</span></span><span class="mutant2">a</span>r',
      ]);
    });

    it('should support falsy attribute values', () => {
      const result = transformHighlightedLines('const foo = bar;', function* ({ offset }) {
        if (offset === 6) {
          yield { elementName: 'span', id: 0, attributes: { 'mutant-id': 0 } };
        }
        if (offset === 9) {
          yield { elementName: 'span', id: 0, isClosing: true };
        }
      });
      expect(result).deep.eq(['const <span mutant-id="0">foo</span> = bar;']);
    });
  });

  describe('parse errors', () => {
    it("should throw if tag doesn't close", () => {
      expect(() => transformHighlightedLines('<span class=""')).throws('Missing closing tag near n class=""');
    });
    it('should throw if closing a non-started tag', () => {
      expect(() => transformHighlightedLines('</span>')).throws('Cannot find corresponding opening tag for </span>');
    });
  });
});

describe(findDiffIndices.name, () => {
  it('should provide the entire line when everything is different', () => {
    expect(findDiffIndices('asd', 'fgh')).deep.eq([0, 3]);
  });

  it('should be able to recognize a different operator', () => {
    expect(findDiffIndices('foo + bar', 'foo - bar')).deep.eq([4, 5]);
  });

  it('should provide the quotes on an empty string diff', () => {
    expect(findDiffIndices('const foo = "bar"', 'const foo = ""')).deep.eq([12, 14]);
  });

  it('should provide the full keywords for `true` and `false`', () => {
    expect(findDiffIndices('const foo = true', 'const foo = false')).deep.eq([12, 17]);
    expect(findDiffIndices('const foo = false', 'const foo = true')).deep.eq([12, 16]);
    expect(findDiffIndices('if(type === 1) {', 'if(true) {')).deep.eq([3, 7]);
  });

  it('should provide the braces of an empty block', () => {
    expect(findDiffIndices('function add(a, b){\n  return a + b;\n}', 'function add(a, b){}')).deep.eq([18, 20]);
  });
});

describe(determineLanguage.name, () => {
  it.each([
    ['cs', ProgrammingLanguage.csharp],
    ['html', ProgrammingLanguage.html],
    ['java', ProgrammingLanguage.java],
    ['js', ProgrammingLanguage.javascript],
    ['cjs', ProgrammingLanguage.javascript],
    ['mjs', ProgrammingLanguage.javascript],
    ['ts', ProgrammingLanguage.typescript],
    ['tsx', ProgrammingLanguage.typescript],
    ['cts', ProgrammingLanguage.typescript],
    ['mts', ProgrammingLanguage.typescript],
    ['scala', ProgrammingLanguage.scala],
    ['php', ProgrammingLanguage.php],
    ['vue', ProgrammingLanguage.vue],
    ['feature', ProgrammingLanguage.gherkin],
  ] as const)(`should recognize file.%s as language %s`, (extension, expected) => {
    expect(determineLanguage(`file.${extension}`)).eq(expected);
  });

  it('should result in undefined for unrecognized languages', () => {
    expect(determineLanguage('file.haskell')).undefined;
  });
});
