import { expect } from 'chai';
import { MutationTestResult } from 'mutation-testing-report-schema/api';
import { aggregateResultsByModule } from '../../src';
import { createFileResult, createMutationTestResult, createTestFile } from '../helpers/factories';

describe.only(aggregateResultsByModule.name, () => {
  it('should result in an empty report when an empty object is provided', () => {
    const expectedReport: MutationTestResult = {
      files: {},
      schemaVersion: '1.7',
      thresholds: { high: 80, low: 60 },
      config: {},
      projectRoot: undefined,
    };
    expect(aggregateResultsByModule(Object.create(null))).deep.eq(expectedReport);
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
      const file = createFileResult();
      const module = createMutationTestResult({ files: { a: file } });
      const result = aggregateResultsByModule({ module });
      expect(result.files).deep.eq({ 'module/a': file });
    });
    it('should merge file results together', () => {
      const fileA = createFileResult();
      const fileB = createFileResult();
      const fileC = createFileResult();
      const core = createMutationTestResult({ files: { a: fileA, b: fileB } });
      const api = createMutationTestResult({ files: { a: fileC } });
      const result = aggregateResultsByModule({ core, api });
      expect(result.files).deep.eq({ 'core/a': fileA, 'core/b': fileB, 'api/a': fileC });
    });
  });

  describe('testFiles', () => {
    it('should prefix test files with the module name', () => {
      const file = createTestFile();
      const module = createMutationTestResult({ testFiles: { a: file } });
      const result = aggregateResultsByModule({ module });
      expect(result.testFiles).deep.eq({ 'module/a': file });
    });
    it('should merge test file results together', () => {
      const fileA = createTestFile();
      const fileB = createTestFile();
      const fileC = createTestFile();
      const core = createMutationTestResult({ testFiles: { a: fileA, b: fileB } });
      const api = createMutationTestResult({ testFiles: { a: fileC } });
      const result = aggregateResultsByModule({ core, api });
      expect(result.testFiles).deep.eq({ 'core/a': fileA, 'core/b': fileB, 'api/a': fileC });
    });
    it('should allow undefined test files', () => {
      const fileA = createTestFile();
      const fileB = createTestFile();
      const core = createMutationTestResult({ testFiles: { a: fileA, b: fileB } });
      const api = createMutationTestResult({ testFiles: undefined });
      const result = aggregateResultsByModule({ core, api });
      expect(result.testFiles).deep.eq({ 'core/a': fileA, 'core/b': fileB });
    });
  });
});
