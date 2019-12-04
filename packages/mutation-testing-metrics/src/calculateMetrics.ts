import { compareNames, normalizeFileNames, flatMap } from './helpers';
import { FileResultDictionary, FileResult, MutantResult, MutantStatus } from 'mutation-testing-report-schema';
import groupBy from 'lodash.groupby';
import { Metrics } from './api/Metrics';
import { MetricsResult } from './api/MetricsResult';
const DEFAULT_SCORE = 100;
const ROOT_NAME = 'All files';

/**
 * Calculates the metrics inside of a mutation testing report
 * @param files The files inside the mutation testing report
 * @returns A MetricsResult containing the metrics for the entire report. See `childResults`
 */
export function calculateMetrics(files: FileResultDictionary): MetricsResult {
  const normalizedFiles = normalizeFileNames(files);
  return calculateDirectoryMetrics(normalizedFiles, ROOT_NAME);
}

function calculateDirectoryMetrics(files: FileResultDictionary, name: string): MetricsResult {
  const metrics = countMetrics(flatMap(Object.values(files), file => file.mutants));
  const childResults = toChildModels(files);
  return {
    name,
    childResults,
    metrics
  };
}

function calculateFileMetrics(fileName: string, file: FileResult): MetricsResult {
  return {
    file,
    name: fileName,
    childResults: [],
    metrics: countMetrics(file.mutants)
  };
}

function toChildModels(files: FileResultDictionary): MetricsResult[] {
  const filesByDirectory = groupBy(Object.entries(files), namedFile => namedFile[0].split('/')[0]);
  return Object.keys(filesByDirectory)
    .map(directoryName => {
      if (filesByDirectory[directoryName].length > 1 || filesByDirectory[directoryName][0][0] !== directoryName) {
        const directoryFiles: FileResultDictionary = {};
        filesByDirectory[directoryName].forEach(
          file => directoryFiles[file[0].substr(directoryName.length + 1)] = file[1]
        );
        return calculateDirectoryMetrics(directoryFiles, directoryName);
      } else {
        const fileName = filesByDirectory[directoryName][0][0];
        const file = filesByDirectory[directoryName][0][1];
        return calculateFileMetrics(fileName, file);
      }
    })
    .sort(compareNames);
}

function countMetrics(mutants: Pick<MutantResult, 'status'>[]): Metrics {
  const count = (status: MutantStatus) => mutants.filter(_ => _.status === status).length;
  const killed = count(MutantStatus.Killed);
  const timeout = count(MutantStatus.Timeout);
  const survived = count(MutantStatus.Survived);
  const noCoverage = count(MutantStatus.NoCoverage);
  const runtimeErrors = count(MutantStatus.RuntimeError);
  const compileErrors = count(MutantStatus.CompileError);
  const totalDetected = timeout + killed;
  const totalUndetected = survived + noCoverage;
  const totalCovered = totalDetected + survived;
  const totalValid = totalUndetected + totalDetected;
  const totalInvalid = runtimeErrors + compileErrors;
  return {
    killed,
    timeout,
    survived,
    noCoverage,
    runtimeErrors,
    compileErrors,
    totalDetected,
    totalUndetected, totalCovered,
    totalValid,
    totalInvalid,
    mutationScore: totalValid > 0 ? totalDetected / totalValid * 100 : DEFAULT_SCORE,
    totalMutants: totalValid + totalInvalid,
    mutationScoreBasedOnCoveredCode: totalValid > 0 ? totalDetected / totalCovered * 100 || 0 : DEFAULT_SCORE
  };
}
