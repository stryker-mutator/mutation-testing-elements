import { expect, AssertionError } from 'chai';
import { toDirectoryModel, DirectoryResultModel, FileResultModel, TotalsModel } from '../../../src/model';
import { FileResult, MutantResult, MutantStatus } from 'mutation-testing-report-schema';
import chai from 'chai';
chai.config.truncateThreshold = 0;

function createMutantResult(overrides?: Partial<MutantResult>): MutantResult {
  const defaults: MutantResult = {
    id: '1',
    location: {
      end: {
        column: 3,
        line: 1
      },
      start: {
        column: 1,
        line: 1
      }
    },
    mutatorName: 'bazMutator',
    replacement: 'baz',
    status: MutantStatus.Killed
  };
  return { ...defaults, ...overrides };
}

export function createFileResult(overrides?: Partial<FileResult>): FileResult {
  const defaults: FileResult = {
    language: 'js',
    mutants: [
      createMutantResult()
    ],
    source: 'const bar = foo();'
  };
  return { ...defaults, ...overrides };
}

describe(toDirectoryModel.name, () => {

  it('should work with a simple file', () => {
    const fileResult = createFileResult();
    const model = toDirectoryModel({
      'foo.js': fileResult
    });
    const expectedFile = new FileResultModel('foo.js', 'foo.js', fileResult);
    const expected = new DirectoryResultModel('All files', '', expectedFile.totals, [
      expectedFile
    ]);
    expect(model).deep.eq(expected);
  });

  it('should group files in directories', () => {
    // Arrange
    const foo = createFileResult();
    const foo2 = createFileResult();
    const expectedFile = new FileResultModel('foo.js', 'bar/foo.js', foo);
    const expectedFile2 = new FileResultModel('foo2.js', 'bar/foo2.js', foo2);
    const totals = new TotalsModel([...foo.mutants, ...foo2.mutants]);
    const expected = new DirectoryResultModel('All files', '', totals, [
      new DirectoryResultModel('bar', 'bar', totals, [
        expectedFile,
        expectedFile2
      ])
    ]);

    // Act
    const actual = toDirectoryModel({
      'bar/foo.js': foo,
      'bar/foo2.js': foo2
    });

    // Assert
    expect(actual).deep.eq(expected);
  });

  it('should group filter out files in directories', () => {
    // Arrange
    const csharpFile = createFileResult({ source: 'using System;', language: 'c#' });
    const scalaFile = createFileResult({ source: 'import java.lang;', language: 'scala' });
    const jsFile = createFileResult({ source: 'const fs = require("fs");', language: 'javascript' });
    const expectedCsharpFile = new FileResultModel('Class.cs', 'foo/bar/Class.cs', csharpFile);
    const expectedScalaFile = new FileResultModel('Class.scala', 'foo/bar/Class.scala', scalaFile);
    const expectedJSFile = new FileResultModel('main.js', 'baz/main.js', jsFile);
    const totals = new TotalsModel([...jsFile.mutants, ...csharpFile.mutants, ...scalaFile.mutants]);
    const bazTotals = new TotalsModel([...jsFile.mutants]);
    const fooBarTotals = new TotalsModel([...csharpFile.mutants, ...scalaFile.mutants]);
    const expected = new DirectoryResultModel('All files', '', totals, [
      new DirectoryResultModel('baz', 'baz', bazTotals, [expectedJSFile]),
      new DirectoryResultModel('foo', 'foo', fooBarTotals, [
        new DirectoryResultModel('bar', 'foo/bar', fooBarTotals, [
          expectedCsharpFile,
          expectedScalaFile
        ])
      ]),
    ]);

    // Act
    const actual = toDirectoryModel({
      'baz/main.js': jsFile,
      'foo/bar/Class.cs': csharpFile,
      'foo/bar/Class.scala': scalaFile
    });

    // Assert
    expect(actual).deep.eq(expected);
  });

  it('should sort on file type and alphabet', () => {
    const file = createFileResult();
    const actual = toDirectoryModel({
      'a': file, // => 4
      'A/a': file, // => 0
      'Ac/a': file, // => 1
      'b/a': file, // => 2
      'B/a': file, // => 3
      'z': file // => 5
    });
    expectFile(expectDirectory(actual.childResults[0], 'A').childResults[0], 'a');
    expectFile(expectDirectory(actual.childResults[1], 'Ac').childResults[0], 'a');
    expectFile(expectDirectory(actual.childResults[2], 'b').childResults[0], 'a');
    expectFile(expectDirectory(actual.childResults[3], 'B').childResults[0], 'a');
    expectFile(actual.childResults[4], 'a');
    expectFile(actual.childResults[5], 'z');
  });

  function expectDirectory(actual: FileResultModel | DirectoryResultModel, expectedName: string) {
    expect(actual.name).eq(expectedName);
    if (actual.representsFile) {
      throw new AssertionError(`Expected ${actual.name} to be a directory model, but was a file model`);
    } else {
      return actual;
    }
  }

  function expectFile(actual: FileResultModel | DirectoryResultModel, expectedName: string) {
    expect(actual.name).eq(expectedName);
    if (actual.representsFile) {
      return actual;
    } else {
      throw new AssertionError(`Expected ${actual.name} to be a directory model, but was a file model`);
    }
  }
});
