import { expect } from 'chai';
import { normalizeFileNames } from '../../src/helpers';
import { FileResultDictionary } from 'mutation-testing-report-schema';

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
      ['root/baz/qux']: baz
    });
  });
});
