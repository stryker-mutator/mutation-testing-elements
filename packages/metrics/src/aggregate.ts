import { MutationTestResult, TestFileDefinitionDictionary } from 'mutation-testing-report-schema';
import { determineCommonBasePath, isNotNullish, normalizeFileNames } from './helpers';

/**
 * Merges multiple reports together into a single report, grouped by module.
 * Does best guesses regarding `system`, `framework` and `projectRoot`
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
      aggregatedResult.files[`${moduleName}/${fileName}`] = fileResult;
    });
    if (report.testFiles) {
      const aggregatedTestFiles: TestFileDefinitionDictionary = aggregatedResult.testFiles ?? (aggregatedResult.testFiles = Object.create(null));
      Object.entries(normalizeFileNames(report.testFiles)).forEach(([fileName, testFileResult]) => {
        aggregatedTestFiles[`${moduleName}/${fileName}`] = testFileResult;
      });
    }

    return acc;
  }, aggregatedResult);
}
