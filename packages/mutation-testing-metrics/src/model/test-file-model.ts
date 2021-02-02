import { TestFile as TestFile } from 'mutation-testing-report-schema';
import { TestModel } from './test-model';

/**
 * Represents a file that contains tests
 */
export class TestFileModel implements TestFile {
  tests: TestModel[];
  constructor(input: TestFile) {
    this.tests = input.tests.map((testDefinition) => new TestModel(testDefinition));
  }
}
