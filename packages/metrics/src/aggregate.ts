import type { MutationTestResult, TestFileDefinitionDictionary } from 'mutation-testing-report-schema';

import { determineCommonBasePath, isNotNullish, normalizeFileNames } from './helpers/index.js';

/**
 * Aggregates multiple reports together into a single report, grouped by module.
 *
 * @param resultsByModule The MutationTestResult objects by module name
 * @returns An aggregated result of all provided reports.
 */
export function aggregateResultsByModule(resultsByModule: Record<string, MutationTestResult>): MutationTestResult {
  const projectRoots = Object.values(resultsByModule)
    .map((report) => report.projectRoot)
    .filter(isNotNullish);
  const aggregatedResult: MutationTestResult = {
    files: {},
    schemaVersion: '1.7',
    thresholds: resultsByModule[0]?.thresholds ?? { high: 80, low: 60 },
    projectRoot: projectRoots.length ? determineCommonBasePath(projectRoots) : undefined,
    config: {},
  };

  return Object.entries(resultsByModule).reduce((acc, [moduleName, report]) => {
    Object.entries(normalizeFileNames(report.files)).forEach(([fileName, fileResult]) => {
      aggregatedResult.files[`${moduleName}/${fileName}`] = {
        ...fileResult,
        mutants: [
          ...fileResult.mutants.map(({ id, coveredBy, killedBy, ...mutantData }) => ({
            ...mutantData,
            id: toUniqueId(moduleName, id),
            killedBy: toUniqueIds(moduleName, killedBy),
            coveredBy: toUniqueIds(moduleName, coveredBy),
          })),
        ],
      };
    });
    if (report.testFiles) {
      const aggregatedTestFiles: TestFileDefinitionDictionary = aggregatedResult.testFiles ?? (aggregatedResult.testFiles = Object.create(null));
      Object.entries(normalizeFileNames(report.testFiles)).forEach(([fileName, testFileResult]) => {
        aggregatedTestFiles[`${moduleName}/${fileName}`] = {
          ...testFileResult,
          tests: testFileResult.tests.map(({ id, ...testData }) => ({ ...testData, id: toUniqueId(moduleName, id) })),
        };
      });
    }

    return acc;
  }, aggregatedResult);
}

function toUniqueIds(moduleName: string, localIds: string[] | undefined): string[] | undefined {
  if (localIds) {
    const toUniqueIdForModule = toUniqueId.bind(undefined, moduleName);
    return localIds.map(toUniqueIdForModule);
  }
  return;
}

function toUniqueId(moduleName: string, localId: string) {
  return `${moduleName}_${localId}`;
}
