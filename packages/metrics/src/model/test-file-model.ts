import { TestFile as TestFile } from 'mutation-testing-report-schema/api';
import { SourceFile } from './source-file';
import { TestModel } from './test-model';

/**
 * Represents a file that contains tests
 */
export class TestFileModel extends SourceFile implements TestFile {
  tests: TestModel[];
  source: string | undefined;

  /**
   * @param input the test file content
   * @param name the file name
   */
  constructor(input: TestFile, public name: string) {
    super();
    this.source = input.source;
    this.tests = input.tests.map((testDefinition) => {
      const test = new TestModel(testDefinition);
      test.sourceFile = this;
      return test;
    });
  }
}
