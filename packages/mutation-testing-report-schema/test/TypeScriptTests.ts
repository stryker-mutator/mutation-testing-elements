import { FileResult, FileResultDictionary, Location, MutantResult, MutantStatus, MutationTestResult, Position, Thresholds } from '../src';

const mutantStatus = MutantStatus.Killed;
const position: Position = {
  column: 1,
  line: 42,
  // @ts-expect-error check to see if the index signature is missing
  depth: 32,
};
const location: Location = {
  end: position,
  start: position,

  // @ts-expect-error check to see if the index signature is missing
  middle: position,
};
const mutantResult: MutantResult = {
  id: '32',
  location: location,
  mutatorName: 'fooMutator',
  status: mutantStatus,
  description: 'changed foo in bar',
  replacement: 'bar',

  // @ts-expect-error check to see if the index signature is missing
  alive: false,
};
const fileResult: FileResult = {
  language: 'TS',
  mutants: [mutantResult],
  source: 'console.log("foo")',

  // @ts-expect-error check to see if the index signature is missing
  isDir: false,
};

const fileDictionary: FileResultDictionary = {
  ['foo.js']: fileResult,

  // @ts-expect-error check to see if the index signature is missing
  ['readme']: 'this is an invalid file result',
};

const thresholds: Thresholds = {
  high: 80,
  low: 60,

  // @ts-expect-error check to see if the index signature is missing
  middle: 70,
};

export const result: MutationTestResult = {
  files: fileDictionary,
  schemaVersion: '1.3',
  thresholds,
  projectRoot: 'project/root',

  // @ts-expect-error check to see if the index signature is missing
  aliveMutants: [],
};
