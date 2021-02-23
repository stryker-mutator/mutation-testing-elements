import { expect } from 'chai';
import { TestFile } from 'mutation-testing-report-schema';
import { TestFileModel, TestModel } from '../../../src';
import { createLocation, createTestDefinition, createTestFile } from '../../helpers/factories';

describe(TestFileModel.name, () => {
  it('should copy over all values from file result', () => {
    const fileResult: Required<TestFile> = {
      source: 'describe("foo")',
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

  describe(TestFileModel.prototype.getLines.name, () => {
    // Implementation is tested in file-under-test-model.spec.ts

    it('should throw when the source is undefined', () => {
      const sut = new TestFileModel(createTestFile({ source: undefined }));
      expect(() => sut.getLines(createLocation())).throws('sourceFile.source is undefined');
    });
  });
});
