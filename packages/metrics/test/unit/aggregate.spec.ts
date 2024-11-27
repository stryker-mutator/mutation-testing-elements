import { expect } from 'chai';
import type { MutationTestResult } from 'mutation-testing-report-schema';

import { aggregateResultsByModule } from '../../src/index.js';
import { createFileResult, createMutantResult, createMutationTestResult, createTestDefinition, createTestFile } from '../helpers/factories.js';

describe(aggregateResultsByModule.name, () => {
  it('should result in an empty report when an empty object is provided', () => {
    const expectedReport: MutationTestResult = {
      files: {},
      schemaVersion: '1.7',
      thresholds: { high: 80, low: 60 },
      config: {},
      projectRoot: undefined,
    };
    expect(aggregateResultsByModule(Object.create(null) as Record<string, MutationTestResult>)).deep.eq(expectedReport);
    expect(aggregateResultsByModule(Object.create({}) as Record<string, MutationTestResult>)).deep.eq(expectedReport);
  });

  describe('projectRoot', () => {
    it('should determine the common project root over all modules', () => {
      const modules: Record<string, MutationTestResult> = {
        module1: createMutationTestResult({ projectRoot: 'c:\\tmp\\repo\\packages\\core' }),
        module2: createMutationTestResult({ projectRoot: 'c:\\tmp\\repo\\packages\\api' }),
      };
      const result = aggregateResultsByModule(modules);
      expect(result.projectRoot).eq('c:/tmp/repo/packages');
    });

    it('should allow for an empty project root', () => {
      const modules: Record<string, MutationTestResult> = {
        module1: createMutationTestResult({ projectRoot: undefined }),
        module2: createMutationTestResult({ projectRoot: undefined }),
      };
      const result = aggregateResultsByModule(modules);
      expect(result.projectRoot).undefined;
    });
  });

  describe('files', () => {
    it('should prefix files with the module name', () => {
      const file = createFileResult({ mutants: [] });
      const module = createMutationTestResult({ files: { a: file } });
      const result = aggregateResultsByModule({ module });
      expect(result.files).deep.eq({ 'module/a': file });
    });
    it('should merge file results together', () => {
      const fileA = createFileResult({ source: 'core/a', mutants: [] });
      const fileB = createFileResult({ source: 'core/b', mutants: [] });
      const fileC = createFileResult({ source: 'api/c', mutants: [] });
      const core = createMutationTestResult({ files: { a: fileA, b: fileB } });
      const api = createMutationTestResult({ files: { a: fileC } });
      const result = aggregateResultsByModule({ core, api });
      expect(result.files).deep.eq({ 'core/a': fileA, 'core/b': fileB, 'api/a': fileC });
    });
  });

  describe('testFiles', () => {
    it('should prefix test files with the module name', () => {
      const file = createTestFile({ tests: [] });
      const module = createMutationTestResult({ testFiles: { a: file } });
      const result = aggregateResultsByModule({ module });
      expect(result.testFiles).deep.eq({ 'module/a': file });
    });
    it('should merge test file results together', () => {
      const fileA = createTestFile({ source: 'fileA', tests: [] });
      const fileB = createTestFile({ source: 'fileB', tests: [] });
      const fileC = createTestFile({ source: 'fileC', tests: [] });
      const core = createMutationTestResult({ testFiles: { a: fileA, b: fileB } });
      const api = createMutationTestResult({ testFiles: { a: fileC } });
      const result = aggregateResultsByModule({ core, api });
      expect(result.testFiles).deep.eq({ 'core/a': fileA, 'core/b': fileB, 'api/a': fileC });
    });
    it('should allow undefined test files', () => {
      const fileA = createTestFile({ source: 'fileA', tests: [] });
      const fileB = createTestFile({ source: 'fileB', tests: [] });
      const core = createMutationTestResult({ testFiles: { a: fileA, b: fileB } });
      const api = createMutationTestResult({ testFiles: undefined });
      const result = aggregateResultsByModule({ core, api });
      expect(result.testFiles).deep.eq({ 'core/a': fileA, 'core/b': fileB });
    });
  });

  describe('mutants', () => {
    it('should prefix mutant ids with moduleName', () => {
      // Arrange
      const fileA = createFileResult({ mutants: [createMutantResult({ id: '1' })] });
      const fileB = createFileResult({ mutants: [createMutantResult({ id: '1' })] });
      const core = createMutationTestResult({ files: { a: fileA } });
      const api = createMutationTestResult({ files: { b: fileB } });

      // Act
      const result = aggregateResultsByModule({ core, api });

      // Assert
      const mutantsCore = result.files['core/a'].mutants;
      const mutantsApi = result.files['api/b'].mutants;
      expect(mutantsCore).lengthOf(1);
      expect(mutantsApi).lengthOf(1);
      expect(mutantsCore[0].id).eq('core_1');
      expect(mutantsApi[0].id).eq('api_1');
    });

    it('should prefix coveredBy with moduleName', () => {
      // Arrange
      const fileA = createFileResult({ mutants: [createMutantResult({ coveredBy: ['1'] })] });
      const fileB = createFileResult({ mutants: [createMutantResult({ coveredBy: ['1', '2'] })] });
      const core = createMutationTestResult({ files: { a: fileA } });
      const api = createMutationTestResult({ files: { b: fileB } });

      // Act
      const result = aggregateResultsByModule({ core, api });

      // Assert
      const [mutantCore] = result.files['core/a'].mutants;
      const [mutantApi] = result.files['api/b'].mutants;
      expect(mutantCore.coveredBy).deep.eq(['core_1']);
      expect(mutantApi.coveredBy).deep.eq(['api_1', 'api_2']);
    });

    it('should prefix killedBy with moduleName', () => {
      // Arrange
      const fileA = createFileResult({ mutants: [createMutantResult({ killedBy: ['1'] })] });
      const fileB = createFileResult({ mutants: [createMutantResult({ killedBy: ['1', '2'] })] });
      const core = createMutationTestResult({ files: { a: fileA } });
      const api = createMutationTestResult({ files: { b: fileB } });

      // Act
      const result = aggregateResultsByModule({ core, api });

      // Assert
      const [mutantCore] = result.files['core/a'].mutants;
      const [mutantApi] = result.files['api/b'].mutants;
      expect(mutantCore.killedBy).deep.eq(['core_1']);
      expect(mutantApi.killedBy).deep.eq(['api_1', 'api_2']);
    });
  });
  describe('tests', () => {
    it('should prefix test ids with moduleName', () => {
      // Arrange
      const fileA = createTestFile({ tests: [createTestDefinition({ id: '1' })] });
      const fileB = createTestFile({ tests: [createTestDefinition({ id: '1' })] });
      const core = createMutationTestResult({ testFiles: { a: fileA } });
      const api = createMutationTestResult({ testFiles: { b: fileB } });

      // Act
      const result = aggregateResultsByModule({ core, api });

      // Assert
      const testsCore = result.testFiles!['core/a'].tests;
      const testsApi = result.testFiles!['api/b'].tests;
      expect(testsCore).lengthOf(1);
      expect(testsApi).lengthOf(1);
      expect(testsCore[0].id).eq('core_1');
      expect(testsApi[0].id).eq('api_1');
    });
  });
});
