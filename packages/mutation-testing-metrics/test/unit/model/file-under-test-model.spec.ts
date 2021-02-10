import { expect } from 'chai';
import { FileResult } from 'mutation-testing-report-schema';
import { FileUnderTestModel, MutantModel } from '../../../src';
import { createFileResult, createMutantResult } from '../../helpers/factories';

describe(FileUnderTestModel.name, () => {
  it('should copy over all values from file result', () => {
    const fileResult: Required<FileResult> = {
      language: 'js',
      mutants: [createMutantResult({ id: 'mut-1' })],
      source: 'foo(bar);',
    };
    expect(new FileUnderTestModel(fileResult)).deep.eq(fileResult);
  });

  it('should create mutant model objects', () => {
    const fileResult = createFileResult({
      mutants: [createMutantResult({ id: 'mut-1' })],
    });
    const actual = new FileUnderTestModel(fileResult);
    expect(actual.mutants[0]).instanceOf(MutantModel);
  });
});
