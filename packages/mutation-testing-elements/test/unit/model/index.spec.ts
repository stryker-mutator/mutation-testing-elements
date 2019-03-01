import { expect } from 'chai';
import { toDirectoryModel, DirectoryResultModel, FileResultModel, TotalsModel } from '../../../src/model';
import { FileResult, MutantResult, MutantStatus } from 'mutation-testing-report-schema';

function createMutantResult(overrides?: Partial<MutantResult>): MutantResult {
  const defaults: MutantResult = {
    id: '1',
    location: {
      end: {
        column: 3,
        line: 4
      },
      start: {
        column: 1,
        line: 2
      }
    },
    mutatorName: 'bazMutator',
    replacement: 'baz',
    status: MutantStatus.Killed
  };
  return { ...defaults, ...overrides };
}

function createFileResult(overrides?: Partial<FileResult>): FileResult {
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
});
