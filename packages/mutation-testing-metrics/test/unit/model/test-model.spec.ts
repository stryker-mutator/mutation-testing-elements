import { expect } from 'chai';
import { TestDefinition } from 'mutation-testing-report-schema';
import { MutantModel, TestModel } from '../../../src';
import { createLocation, createMutantResult, createTestDefinition } from '../../helpers/factories';

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
});
