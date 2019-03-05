import { lines, flatMap, normalizeFileNames, determineCommonBasePath, renderCode } from '../../../src/lib/helpers';
import { FileResultDictionary, MutantStatus } from 'mutation-testing-report-schema';
import { expect } from 'chai';
import { FileResultModel } from '../../../src/model';

describe(lines.name, () => {
  it('should split on unix line endings', () => {
    expect(lines('foo\nbar\nbaz')).deep.eq(['foo', 'bar', 'baz']);
  });

  it('should split on windows line endings', () => {
    expect(lines('foo\r\nbar\r\nbaz')).deep.eq(['foo', 'bar', 'baz']);
  });
});

describe(flatMap.name, () => {
  it('should make a flat map from input', () => {
    const actualResult = flatMap([['foo', 'bar'], ['baz', 'qux']], input => input);
    expect(actualResult).deep.eq(['foo', 'bar', 'baz', 'qux']);
  });
});

describe(normalizeFileNames.name, () => {
  it('should translate "\\" to "/"', () => {
    // Arrange
    const baz = {
      language: 'bazLang',
      mutants: [],
      source: 'baz lang'
    };
    const foo = {
      language: 'fooLang',
      mutants: [],
      source: 'foo lang'
    };
    const input: FileResultDictionary = {
      ['c:\\tmp\\foo/bar']: foo,
      ['/root/baz\\qux']: baz
    };

    // Act
    const actual = normalizeFileNames(input);

    // Assert
    expect(actual).deep.eq({
      ['c:/tmp/foo/bar']: foo,
      ['root/baz/qux']: baz,
    });
  });
});

describe(determineCommonBasePath.name, () => {

  it('should return empty string if there are no files', () => {
    expect(determineCommonBasePath([])).eq('');
  });

  it('should return empty string if nothing in common', () => {
    expect(determineCommonBasePath(['foo/bar', 'baz/qux'])).eq('');
  });

  it('should determine a common root', () => {
    expect(determineCommonBasePath(['tmp/foo/bar', 'tmp/baz/qux'])).eq('tmp');
  });

  it('should ignore common characters in dir names', () => {
    expect(determineCommonBasePath(['tmp/foo/bar', 'tmp/foo2/qux'])).eq('tmp');
  });
});

describe(renderCode.name, () => {
  it('should insert mutants in expected places, with correct backgrounds', () => {
    const input = new FileResultModel('', '', {
      language: 'javascript',
      mutants: [
        {
          id: '1', location: { end: { column: 17, line: 1 }, start: { column: 14, line: 1 } },
          mutatorName: 'Foo', replacement: 'foo', status: MutantStatus.Killed
        }
      ],
      source: `
      const foo = 'bar';

      function add(a, b) {
        return a + b;
      }`.replace(/      /g, '').trim(),
    });
    const actualCode = renderCode(input);
    expect(actualCode).eq('<span>const foo = &#039;</span><mutation-test-report-mutant mutant-id="1"><span class="bg-success-light">bar</span></mutation-test-report-mutant><span class="bg-null">&#039;;\n\nfunction add(a, b) {\n  return a + b;\n}</span>');
  });
});
