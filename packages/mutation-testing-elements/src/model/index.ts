import { FileResultDictionary } from 'mutation-testing-report-schema';
import { flatMap, ROOT_NAME, pathJoin } from '../lib/helpers';
import { TotalsModel } from './TotalsModel';
import groupBy from 'lodash.groupby';
import { DirectoryResultModel } from './DirectoryResultModel';
import { ResultModel } from './ResultModel';
import { FileResultModel } from './FileResultModel';

export {
  FileResultModel,
  DirectoryResultModel,
  TotalsModel
};

export function toDirectoryModel(files: FileResultDictionary, name = ROOT_NAME, path = ''): DirectoryResultModel {
  const totals = new TotalsModel(flatMap(Object.values(files), file => file.mutants));
  const childResults = toChildModels(files, path);
  return new DirectoryResultModel(name, path, totals, childResults);
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
        return new FileResultModel(fileName, pathJoin(parent, fileName), file);
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
