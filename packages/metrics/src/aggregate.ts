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
    // Cache the unique ids per module. Test ids repeat in the `coveredBy`/`killedBy` lists of many mutants,
    // reusing the same string instance saves a lot of memory on large reports.
    const uniqueIds = new Map<string, string>();
    const toUniqueId = (localId: string) => {
      let uniqueId = uniqueIds.get(localId);
      if (uniqueId === undefined) {
        uniqueId = `${moduleName}_${localId}`;
        uniqueIds.set(localId, uniqueId);
      }
      return uniqueId;
    };
    const toUniqueIds = (localIds: string[] | undefined) => localIds?.map(toUniqueId);

    Object.entries(normalizeFileNames(report.files)).forEach(([fileName, fileResult]) => {
      aggregatedResult.files[`${moduleName}/${fileName}`] = {
        ...fileResult,
        mutants: fileResult.mutants.map(({ id, coveredBy, killedBy, ...mutantData }) => ({
          ...mutantData,
          id: toUniqueId(id),
          killedBy: toUniqueIds(killedBy),
          coveredBy: toUniqueIds(coveredBy),
        })),
      };
    });
    if (report.testFiles) {
      const aggregatedTestFiles: TestFileDefinitionDictionary = aggregatedResult.testFiles ?? (aggregatedResult.testFiles = Object.create(null));
      Object.entries(normalizeFileNames(report.testFiles)).forEach(([fileName, testFileResult]) => {
        aggregatedTestFiles[`${moduleName}/${fileName}`] = {
          ...testFileResult,
          tests: testFileResult.tests.map(({ id, ...testData }) => ({ ...testData, id: toUniqueId(id) })),
        };
      });
    }

    return acc;
  }, aggregatedResult);
}
