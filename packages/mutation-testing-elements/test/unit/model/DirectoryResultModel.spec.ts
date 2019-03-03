import { DirectoryResultModel, TotalsModel, FileResultModel } from '../../../src/model';
import { createFileResult } from './index.spec';
import { expect } from 'chai';

describe(DirectoryResultModel.name, () => {
  describe('find', () => {
    it('should find a file', () => {
      const expected = new FileResultModel('foo.js', 'src/foo.js', createFileResult());
      const emptyTotals = new TotalsModel([]);
      const sut = new DirectoryResultModel('All files', '', emptyTotals, [
        new DirectoryResultModel('src', 'src', emptyTotals, [
          expected,
          new FileResultModel('bar.js', 'src/bar.js', createFileResult()),
        ]),
        new DirectoryResultModel('test', 'test', emptyTotals, [
          new FileResultModel('foo.spec.js', 'test/foo.spec.js', createFileResult()),
        ])
      ]);
      expect(sut.find('src/foo.js')).eq(expected);
    });
  });
});
