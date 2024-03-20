import { expect } from 'chai';
import type { MutantResult } from 'mutation-testing-report-schema';
import { MutantModel, TestModel } from '../../../src/index.js';
import { createFileUnderTestModel, createLocation, createMutantResult, createTestDefinition } from '../../helpers/factories.js';

describe(MutantModel.name, () => {
  it('should copy over all values from mutant result', () => {
    const mutantResult: Required<MutantResult> = {
      coveredBy: ['1'],
      description: 'desc',
      duration: 42,
      id: 'mut-id',
      killedBy: ['2'],
      location: createLocation(),
      mutatorName: 'fooMutator',
      replacement: '"bar"',
      static: true,
      status: 'Killed',
      statusReason: 'Foo should have been "bar" but was "baz"',
      testsCompleted: 45,
    };
    const actual = new MutantModel(mutantResult);
    Object.entries(mutantResult).forEach(([key, value]) => {
      expect(actual[key as keyof MutantModel], `Field "${key}" not copied over`).deep.eq(value);
    });
  });

  it('should initialize killedByTests and coveredByTests as undefined', () => {
    const actual = new MutantModel(createMutantResult());
    expect(actual.killedByTests).undefined;
    expect(actual.coveredByTests).undefined;
  });

  (
    [
      ['addCoveredBy', 'coveredByTests'],
      ['addKilledBy', 'killedByTests'],
    ] as const
  ).forEach(([method, property]) => {
    describe(MutantModel.prototype[method].name, () => {
      it('should create an array if not exists', () => {
        const actual = new MutantModel(createMutantResult());
        const test = new TestModel(createTestDefinition());
        actual[method](test);
        expect(actual[property]).deep.eq([test]);
      });
      it('should add to array if called a second time', () => {
        const actual = new MutantModel(createMutantResult());
        const test = new TestModel(createTestDefinition({ id: '1' }));
        const test2 = new TestModel(createTestDefinition({ id: '2' }));
        actual[method](test);
        actual[method](test2);
        expect(actual[property]).deep.eq([test, test2]);
      });
    });
  });

  describe(MutantModel.prototype.getMutatedLines.name, () => {
    it('should be able to show a mutant spanning 1 line', () => {
      const sut = new MutantModel(
        createMutantResult({ replacement: 'baz', location: { start: { line: 2, column: 5 }, end: { line: 2, column: 8 } } }),
      );
      sut.sourceFile = createFileUnderTestModel({ source: '\nfoo.bar();\n qux()\n' });
      const actual = sut.getMutatedLines();
      expect(actual).eq('foo.baz();\n');
    });

    it("should throw if the sourceFile wasn't set", () => {
      const sut = new MutantModel(createMutantResult());
      expect(() => sut.getMutatedLines()).throws('mutant.sourceFile was not defined');
    });
  });

  describe(MutantModel.prototype.getOriginalLines.name, () => {
    it('should be able to show a mutant spanning 1 line', () => {
      const sut = new MutantModel(createMutantResult({ location: { start: { line: 3, column: 1 }, end: { line: 3, column: 2 } } }));
      sut.sourceFile = createFileUnderTestModel({ source: '\nfoo.bar();\nbaz.qux()\n' });
      const actual = sut.getOriginalLines();
      expect(actual).eq('baz.qux()\n');
    });

    it("should throw if the sourceFile wasn't set", () => {
      const sut = new MutantModel(createMutantResult());
      expect(() => sut.getOriginalLines()).throws('mutant.sourceFile was not defined');
    });
  });
});
