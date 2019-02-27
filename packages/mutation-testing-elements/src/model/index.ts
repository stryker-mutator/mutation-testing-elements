import { MutantStatus, FileResultDictionary, FileResult } from 'mutation-testing-report-schema';
import { flatMap, ROOT_NAME, pathJoin } from '../helpers';
import { TotalsModel } from './TotalsModel';
import groupBy from 'lodash.groupby';
import { DirectoryResultModel } from './DirectoryResultModel';
import { ResultModel } from './ResultModel';
import { FileResultModel } from './FileResultModel';
const DEFAULT_SCORE = 100;

export {
  FileResultModel,
  DirectoryResultModel,
  TotalsModel
};

export function toDirectoryModel(files: FileResultDictionary, name = ROOT_NAME, path = ''): DirectoryResultModel {
  const totals = countTotals(Object.keys(files).map(fileName => files[fileName]));
  const childResults = toChildModels(files, path);
  return new DirectoryResultModel(name, path, totals, childResults);
}

function toFileModel(name: string, path: string, file: FileResult) {
  return new FileResultModel(name,
    path,
    countTotals([file]), file.mutants,
    file.source,
    file.language);
}

function toChildModels(files: FileResultDictionary, parent: string): (DirectoryResultModel | FileResultModel)[] {
  const filesByDirectory = groupBy(Object.entries(files), file => file[0].split('/')[0]);
  return Object.keys(filesByDirectory)
    .map(directoryName => {
      if (filesByDirectory[directoryName].length > 1 || filesByDirectory[directoryName][0][0] !== directoryName) {
        const directoryFiles: FileResultDictionary = {};
        filesByDirectory[directoryName].forEach(
          file => directoryFiles[file[0].substr(directoryName.length + 1)] = file[1]
        );
        return toDirectoryModel(directoryFiles, directoryName, pathJoin(parent, directoryName));
      } else {
        const fileName = filesByDirectory[directoryName][0][0];
        const file = filesByDirectory[directoryName][0][1];
        return toFileModel(fileName, pathJoin(parent, fileName), file);
      }
    })
    .sort(compareNames);
}

function compareNames(a: ResultModel, b: ResultModel) {
  const sortValue = (scoreResult: ResultModel) => {
    // Directories first
    if (scoreResult.representsFile) {
      return `1${scoreResult.name}`;
    } else {
      return `0${scoreResult.name}`;
    }
  };
  return sortValue(a).localeCompare(sortValue(b));
}

function countTotals(fileResults: FileResult[]): TotalsModel {
  const mutantResults = flatMap(fileResults, file => file.mutants);
  const count = (status: MutantStatus) => mutantResults.filter(_ => _.status === status).length;

  const killed = count(MutantStatus.Killed);
  const timedOut = count(MutantStatus.Timeout);
  const survived = count(MutantStatus.Survived);
  const noCoverage = count(MutantStatus.NoCoverage);
  const runtimeErrors = count(MutantStatus.RuntimeError);
  const compileErrors = count(MutantStatus.CompileError);
  const totalDetected = timedOut + killed;
  const totalUndetected = survived + noCoverage;
  const totalCovered = totalDetected + survived;
  const totalValid = totalUndetected + totalDetected;
  const totalInvalid = runtimeErrors + compileErrors;
  const totalMutants = totalValid + totalInvalid;
  const mutationScore = totalValid > 0 ? totalDetected / totalValid * 100 : DEFAULT_SCORE;
  const mutationScoreBasedOnCoveredCode = totalValid > 0 ? totalDetected / totalCovered * 100 || 0 : DEFAULT_SCORE;
  return {
    compileErrors,
    killed,
    mutationScore,
    mutationScoreBasedOnCoveredCode,
    noCoverage,
    runtimeErrors,
    survived,
    timeout: timedOut,
    totalCovered,
    totalDetected,
    totalInvalid,
    totalMutants,
    totalUndetected,
    totalValid
  };
}
