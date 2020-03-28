import { lines, renderCode } from '../../../src/lib/codeHelpers';
import { MutantStatus, FileResult } from 'mutation-testing-report-schema';
import { expect } from 'chai';

describe(lines.name, () => {
  it('should split on unix line endings', () => {
    expect(lines('foo\nbar\nbaz')).deep.eq(['foo', 'bar', 'baz']);
  });

  it('should split on windows line endings', () => {
    expect(lines('foo\r\nbar\r\nbaz')).deep.eq(['foo', 'bar', 'baz']);
  });
});

describe(renderCode.name, () => {
  it('should insert mutation-test-report-mutant and color spans whitespace significant', () => {
    const input: FileResult = {
      language: 'javascript',
      mutants: [
        {
          id: '1',
          location: { end: { column: 17, line: 1 }, start: { column: 14, line: 1 } },
          mutatorName: 'Foo',
          replacement: 'foo',
          status: MutantStatus.Killed,
        },
      ],
      source: `const foo = 'bar';

      function add(a, b) {
        return a + b;
      }`
        .replace(/ {6}/g, '')
        .trim(), // strip the padding left
    };
    const actualCode = renderCode(input);
    expect(actualCode).eq(
      '<span>const foo = &#039;</span><mutation-test-report-mutant mutant-id="1"><span class="bg-success-light">bar</span></mutation-test-report-mutant><span class="bg-null">&#039;;\n\nfunction add(a, b) {\n  return a + b;\n}</span>'
    );
  });

  it('should insert mutation-test-report-mutant elements in correct locations', () => {
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
    const actualCode = renderCode(input);
    expect(actualCode).include('<mutation-test-report-mutant mutant-id="1"><span class="bg-success-light">add</span></mutation-test-report-mutant>');
    expect(actualCode).include('<mutation-test-report-mutant mutant-id="2"><span class="bg-danger-light">;\n</span></mutation-test-report-mutant>');
  });
});
