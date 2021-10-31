import { determineLanguage, highlightedCodeTableWithMutants, lines, markTests, ProgrammingLanguage } from '../../../src/lib/code-helpers';
import { MutantStatus, FileResult } from 'mutation-testing-report-schema/api';
import { expect } from 'chai';
import { TestModel } from 'mutation-testing-metrics';
import { createFileResult, createTestDefinition } from '../../helpers/factory';

describe(lines.name, () => {
  it('should split on unix line endings', () => {
    expect(lines('foo\nbar\nbaz')).deep.eq(['foo', 'bar', 'baz']);
  });

  it('should split on windows line endings', () => {
    expect(lines('foo\r\nbar\r\nbaz')).deep.eq(['foo', 'bar', 'baz']);
  });
});

describe.only(highlightedCodeTableWithMutants.name, () => {
  it('should highlight javascript code', () => {
    const input: FileResult = createFileResult({
      language: 'javascript',
      source: "const foo = 'bar';",
      mutants: [],
    });

    const actualCode = highlightedCodeTableWithMutants(input);
    expect(actualCode).contains(
      `<span class="token keyword">const</span> foo <span class="token operator">=</span> <span class="token string">'bar'</span><span class="token punctuation">;</span>`
    );
  });

  it('should insert mte-mutant elements at the end of the line', () => {
    const input: FileResult = {
      language: 'javascript',
      mutants: [
        {
          id: '1',
          location: { end: { column: 13, line: 3 }, start: { column: 10, line: 3 } },
          mutatorName: 'MethodReplacement',
          replacement: 'foo',
          status: MutantStatus.Killed,
        },
        {
          id: '2',
          location: { end: { column: 999 /*Doesn't exist*/, line: 4 }, start: { column: 15, line: 4 } },
          mutatorName: 'SemicolonRemover',
          replacement: '',
          status: MutantStatus.Survived,
        },
      ],
      source: `const foo = 'bar';

      function add(a, b) {
        return a + b;
      }`
        .replace(/ {6}/g, '')
        .trim(), // strip the padding left
    };
    const actualCode = highlightedCodeTableWithMutants(input);
    expect(actualCode).include('add <mte-mutant mutant-id="1">');
    expect(actualCode).include('a + b;<mte-mutant mutant-id="2"></mte-mutant>');
  });
});

describe(markTests.name, () => {
  it('should insert <mte-test> elements whitespace significant', () => {
    const actualCode = markTests('\nit("should work", () => {})', [
      new TestModel(createTestDefinition({ id: 'spec-1', location: { start: { line: 2, column: 3 } } })),
    ]);
    expect(actualCode).eq('<span>\nit<mte-test test-id="spec-1"></mte-test>(&quot;should work&quot;, () =&gt; {})</span>');
  });

  it('should insert the  <mte-test> elements in the correct locations', () => {
    const actualCode = markTests('\nit("should work", () => {})\nit("is great", () => {})', [
      new TestModel(createTestDefinition({ id: 'spec-1', location: { start: { line: 2, column: 3 } } })),
      new TestModel(createTestDefinition({ id: 'spec-2', location: { start: { line: 3, column: 14 } } })),
    ]);
    expect(actualCode).include('it<mte-test test-id="spec-1"></mte-test>(&quot;should work&quot;');
    expect(actualCode).include('it(&quot;is great&quot;<mte-test test-id="spec-2"></mte-test>');
  });

  it('should place a test in the first free non-alfa-numeric character (because columns can be deceiving)', () => {
    const source = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890()\n';
    const tests = [new TestModel(createTestDefinition({ id: 'spec-1', location: { start: { line: 1, column: 1 } } }))];
    const actualCode = markTests(source, tests);
    expect(actualCode).include('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890<mte-test test-id="spec-1"></mte-test>()');
  });

  it('should place tests on a non-existing column on the next line', () => {
    // column 20 doesn't exist
    const source = '  it("foo")\n  it("bar")';
    const tests = [new TestModel(createTestDefinition({ id: 'spec-1', location: { start: { line: 1, column: 20 } } }))];
    const actualCode = markTests(source, tests);
    expect(actualCode).include('it(&quot;foo&quot;)\n<mte-test test-id="spec-1"></mte-test>  it(&quot;bar&quot;)');
  });

  it('should place remaining tests at the end', () => {
    // line 3 doesn't exist
    const source = '  it("foo")\n  it("bar")';
    const tests = [new TestModel(createTestDefinition({ id: 'spec-1', location: { start: { line: 3, column: 1 } } }))];
    const actualCode = markTests(source, tests);
    expect(actualCode).include('it(&quot;bar&quot;)<mte-test test-id="spec-1"></mte-test>');
  });
});

describe(determineLanguage.name, () => {
  (
    [
      ['cs', ProgrammingLanguage.csharp],
      ['html', ProgrammingLanguage.html],
      ['java', ProgrammingLanguage.java],
      ['js', ProgrammingLanguage.javascript],
      ['cjs', ProgrammingLanguage.javascript],
      ['mjs', ProgrammingLanguage.javascript],
      ['ts', ProgrammingLanguage.typescript],
      ['tsx', ProgrammingLanguage.typescript],
      ['scala', ProgrammingLanguage.scala],
      ['php', ProgrammingLanguage.php],
      ['vue', ProgrammingLanguage.vue],
      ['feature', ProgrammingLanguage.gherkin],
    ] as const
  ).forEach(([extension, expected]) => {
    it(`should recognize file.${extension} as language ${expected}`, () => {
      expect(determineLanguage(`file.${extension}`)).eq(expected);
    });
  });

  it('should result in undefined for unrecognized languages', () => {
    expect(determineLanguage('file.haskell')).undefined;
  });
});
