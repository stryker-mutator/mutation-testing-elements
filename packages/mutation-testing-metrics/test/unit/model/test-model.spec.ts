import { expect } from 'chai';
import { TestDefinition } from 'mutation-testing-report-schema';
import { MutantModel, TestModel } from '../../../src';
import { createLocation, createMutantResult, createTestDefinition, createTestFileModel } from '../../helpers/factories';

describe(TestModel.name, () => {
  it('should copy over all values from mutant result', () => {
    const test: Required<TestDefinition> = {
      id: 'test1',
      location: createLocation(),
      name: 'foo should bar',
    };
    expect(new TestModel(test)).deep.eq(test);
  });

  it('should initialize killedByTests and coveredByTests as undefined', () => {
    const actual = new TestModel(createTestDefinition());
    expect(actual.coveredMutants).undefined;
    expect(actual.killedMutants).undefined;
  });

  ([
    ['addCovered', 'coveredMutants'],
    ['addKilled', 'killedMutants'],
  ] as const).forEach(([method, property]) => {
    describe(TestModel.prototype[method].name, () => {
      it('should create an array if not exists', () => {
        const actual = new TestModel(createTestDefinition());
        const mutant = new MutantModel(createMutantResult());
        actual[method](mutant);
        expect(actual[property]).deep.eq([mutant]);
      });
      it('should add to array if called a second time', () => {
        const actual = new TestModel(createTestDefinition());
        const mutant = new MutantModel(createMutantResult({ id: '1' }));
        const mutant2 = new MutantModel(createMutantResult({ id: '2' }));
        actual[method](mutant);
        actual[method](mutant2);
        expect(actual[property]).deep.eq([mutant, mutant2]);
      });
    });
  });

  describe(TestModel.prototype.getLines.name, () => {
    // Implementation of `getLines(location)` is tested in file-under-test-model.spec.ts

    it('should return the line of the test', () => {
      const sut = new TestModel(createTestDefinition({ location: { start: { line: 2, column: 1 } } }));
      sut.sourceFile = createTestFileModel({ source: '\nit("should work", () => {\n  expect(foo()).eq("bar");\n});' });
      expect(sut.getLines()).eq('it("should work", () => {\n');
    });
    it('should throw when sourceFile is undefined', () => {
      const sut = new TestModel(createTestDefinition({ location: { start: { line: 2, column: 1 } } }));
      expect(() => sut.getLines()).throws('test.sourceFile was not defined');
    });
    it('should throw when location is undefined', () => {
      const sut = new TestModel(createTestDefinition({ location: undefined }));
      sut.sourceFile = createTestFileModel({ source: '\nit("should work", () => {\n  expect(foo()).eq("bar");\n});' });
      expect(() => sut.getLines()).throws('test.location was not defined');
    });
  });
});
