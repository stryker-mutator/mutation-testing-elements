import { expect } from 'chai';
import { TestFile } from 'mutation-testing-report-schema';
import { TestFileModel, TestModel } from '../../../src';
import { createTestDefinition, createTestFile } from '../../helpers/factories';

describe(TestFileModel.name, () => {
  it('should copy over all values from file result', () => {
    const fileResult: Required<TestFile> = {
      tests: [createTestDefinition({ id: 'mut-1' })],
    };
    expect(new TestFileModel(fileResult)).deep.eq(fileResult);
  });

  it('should create test model instances', () => {
    const testFile = createTestFile({
      tests: [createTestDefinition({ id: 'test-1' })],
    });
    const actual = new TestFileModel(testFile);
    expect(actual.tests[0]).instanceOf(TestModel);
  });
});
