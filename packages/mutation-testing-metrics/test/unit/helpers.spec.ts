import { expect } from 'chai';
import { normalize } from '../../src/helpers';
import { FileResultDictionary } from 'mutation-testing-report-schema';
import { FileUnderTestModel } from '../../src/model';

describe(normalize.name, () => {
  it('should translate "\\" to "/"', () => {
    // Arrange
    const baz = {
      language: 'bazLang',
      mutants: [],
      source: 'baz lang',
    };
    const foo = {
      language: 'fooLang',
      mutants: [],
      source: 'foo lang',
    };
    const input: FileResultDictionary = {
      ['c:\\tmp\\foo/bar']: foo,
      ['/root/baz\\qux']: baz,
    };

    // Act
    const actual = normalize(input, FileUnderTestModel);

    // Assert
    expect(actual).deep.eq({
      ['c:/tmp/foo/bar']: foo,
      ['root/baz/qux']: baz,
    });
  });
});
