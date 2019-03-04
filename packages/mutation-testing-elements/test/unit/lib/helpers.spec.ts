import { getContextClassForStatus, lines, escapeHtml, flatMap, normalizeFileNames, determineCommonBasePath } from '../../../src/lib/helpers';
import { MutantStatus, FileResultDictionary } from 'mutation-testing-report-schema';
import { expect } from 'chai';

describe(getContextClassForStatus.name, () => {
  function actArrangeAssert(expected: string, input: MutantStatus) {
    it(`should should show "${expected}" for "${input}"`, () => {
      expect(getContextClassForStatus(input)).eq(expected);
    });
  }
  actArrangeAssert('success', MutantStatus.Killed);
  actArrangeAssert('danger', MutantStatus.Survived);
  actArrangeAssert('danger', MutantStatus.NoCoverage);
  actArrangeAssert('warning', MutantStatus.Timeout);
  actArrangeAssert('secondary', MutantStatus.CompileError);
  actArrangeAssert('secondary', MutantStatus.RuntimeError);
});

describe(lines.name, () => {
  it('should split on unix line endings', () => {
    expect(lines('foo\nbar\nbaz')).deep.eq(['foo', 'bar', 'baz']);
  });

  it('should split on windows line endings', () => {
    expect(lines('foo\r\nbar\r\nbaz')).deep.eq(['foo', 'bar', 'baz']);
  });
});

describe(escapeHtml.name, () => {
  function actArrangeAssert(input: string, expectedOutput: string) {
    it(`should translate ${input} to ${expectedOutput}`, () => {
      expect(escapeHtml(input)).eq(expectedOutput);
    });
  }

  actArrangeAssert('foo&bar', 'foo&amp;bar');
  actArrangeAssert('foo<bar', 'foo&lt;bar');
  actArrangeAssert('foo>bar', 'foo&gt;bar');
  actArrangeAssert('foo"bar', 'foo&quot;bar');
  actArrangeAssert('foo\'bar', 'foo&#039;bar');
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

  it('should return empty string if nothing in common', () => {
    expect(determineCommonBasePath(['foo/bar', 'baz/qux'])).deep.eq('');
  });

  it('should determine a common root', () => {
    expect(determineCommonBasePath(['tmp/foo/bar', 'tmp/baz/qux'])).deep.eq('tmp');
  });

  it('should ignore common characters in dir names', () => {
    expect(determineCommonBasePath(['tmp/foo/bar', 'tmp/foo2/qux'])).deep.eq('tmp');
  });
});
