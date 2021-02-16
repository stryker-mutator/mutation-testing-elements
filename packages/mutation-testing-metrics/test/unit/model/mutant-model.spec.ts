import { expect } from 'chai';
import { MutantResult, MutantStatus } from 'mutation-testing-report-schema';
import { MutantModel, TestModel } from '../../../src';
import { createLocation, createMutantResult, createTestDefinition } from '../../helpers/factories';

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
      status: MutantStatus.Killed,
      statusReason: 'Foo should have been "bar" but was "baz"',
      testsCompleted: 45,
    };
    expect(new MutantModel(mutantResult)).deep.eq(mutantResult);
  });

  it('should initialize killedByTests and coveredByTests as undefined', () => {
    const actual = new MutantModel(createMutantResult());
    expect(actual.killedByTests).undefined;
    expect(actual.coveredByTests).undefined;
  });

  ([
    ['addCoveredBy', 'coveredByTests'],
    ['addKilledBy', 'killedByTests'],
  ] as const).forEach(([method, property]) => {
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
});
