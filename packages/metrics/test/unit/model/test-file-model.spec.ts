import { expect } from 'chai';
import type { TestFile } from 'mutation-testing-report-schema';

import { TestFileModel, TestModel } from '../../../src/index.js';
import { createLocation, createTestDefinition, createTestFile } from '../../helpers/factories.js';

describe(TestFileModel.name, () => {
  it('should copy over all values from file result', () => {
    const fileResult: Required<TestFile> = {
      source: 'describe("foo")',
      tests: [],
    };
    expect(new TestFileModel(fileResult, '')).deep.contains(fileResult);
  });

  it('should set the file name', () => {
    const sut = new TestFileModel(createTestFile(), 'bar.spec.js');
    expect(sut.name).deep.eq('bar.spec.js');
  });

  it('should create test model instances', () => {
    const testFile = createTestFile({
      tests: [createTestDefinition({ id: 'test-1' })],
    });
    const actual = new TestFileModel(testFile, '');
    expect(actual.tests[0]).instanceOf(TestModel);
  });

  describe(TestFileModel.prototype.getLines.name, () => {
    // Implementation of `getLines(location)` is tested in file-under-test-model.spec.ts

    it('should throw when the source is undefined', () => {
      const sut = new TestFileModel(createTestFile({ source: undefined }), '');
      expect(() => sut.getLines(createLocation())).throws('sourceFile.source is undefined');
    });
  });
});
