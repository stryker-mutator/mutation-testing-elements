import { expect } from 'chai';
import type { FileResult } from 'mutation-testing-report-schema';
import { FileUnderTestModel, MutantModel } from '../../../src/index.js';
import { createFileResult, createMutantResult } from '../../helpers/factories.js';

describe(FileUnderTestModel.name, () => {
  it('should copy over all values from file result', () => {
    const fileResult: Required<FileResult> = {
      language: 'js',
      mutants: [],
      source: 'foo(bar);',
    };
    const actual = new FileUnderTestModel(fileResult, '');
    expect(actual).deep.include(fileResult);
  });

  it('should set the file name', () => {
    const sut = new FileUnderTestModel(createFileResult(), 'bar.spec.js');
    expect(sut.name).deep.eq('bar.spec.js');
  });

  it('should create mutant model objects and relate itself to them', () => {
    const fileResult = createFileResult({
      mutants: [createMutantResult({ id: 'mut-1' })],
    });
    const actual = new FileUnderTestModel(fileResult, '');
    expect(actual.mutants[0]).instanceOf(MutantModel);
    expect(actual.mutants[0].sourceFile).eq(actual);
  });

  describe(FileUnderTestModel.prototype.getLines.name, () => {
    it('should retrieve a single line if the location spans a single line', () => {
      const sut = new FileUnderTestModel(createFileResult({ source: '\nfoo.bar();\nbaz.qux()\n' }), '');
      const actual = sut.getLines({ start: { line: 3, column: 1 }, end: { line: 3, column: 2 } });
      expect(actual).eq('baz.qux()\n');
    });
    it('should retrieve 3 lines if the location spans a 3 lines', () => {
      const sut = new FileUnderTestModel(createFileResult({ source: '\nfoo.bar();\nconst baz = () => {\n  qux();\n};\n' }), '');
      const actual = sut.getLines({ start: { line: 3, column: 8 }, end: { line: 5, column: 2 } });
      expect(actual).eq('const baz = () => {\n  qux();\n};\n');
    });
    it('should retrieve the starting line if presented with an open end location', () => {
      const sut = new FileUnderTestModel(createFileResult({ source: '\nfoo.bar();\nconst baz = () => {\n  qux();\n};\n' }), '');
      const actual = sut.getLines({ start: { line: 3, column: 8 }, end: undefined });
      expect(actual).eq('const baz = () => {\n');
    });
  });

  describe(FileUnderTestModel.prototype.getMutationLines.name, () => {
    let sut: FileUnderTestModel;

    beforeEach(() => {
      sut = new FileUnderTestModel(createFileResult({ source: '\nfoo.bar();\nconst baz = () => {\n  qux();\n};\n' }), '');
    });

    it('should be able to show a mutant spanning 1 line', () => {
      const mutant = createMutantResult({ replacement: 'baz', location: { start: { line: 2, column: 5 }, end: { line: 2, column: 8 } } });
      const actual = sut.getMutationLines(mutant);
      expect(actual).eq('foo.baz();\n');
    });

    it('should return the mutated lines for a mutant spanning 3 lines', () => {
      const mutant = createMutantResult({ replacement: '{}', location: { start: { line: 3, column: 19 }, end: { line: 5, column: 2 } } });
      const actual = sut.getMutationLines(mutant);
      expect(actual).eq('const baz = () => {};\n');
    });
  });
});
