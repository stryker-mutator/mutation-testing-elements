import type {
  CpuInformation,
  FileResult,
  FileResultDictionary,
  FrameworkInformation,
  Location,
  MutantResult,
  MutantStatus,
  MutationTestResult,
  OpenEndLocation,
  OSInformation,
  PerformanceStatistics,
  Position,
  RamInformation,
  SystemInformation,
  TestDefinition,
  TestFileDefinitionDictionary,
  Thresholds,
} from '../../src/index.js';

const mutantStatus: MutantStatus = 'Killed';
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
  statusReason: 'Expected "foo" to be "bar"',

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

const frameworkInformation: FrameworkInformation = {
  name: 'stryker',
  branding: {
    homepageUrl: 'https://stryker-mutator.io',
    imageUrl: 'https://stryker-mutator.io/img/stryker.svg',
  },
  dependencies: {
    '@stryker-mutator/jasmine-runner': '2.1.1',
  },
  version: '4.3.0',

  // @ts-expect-error check to see if the index signature is missing
  foo: 'bar',
};

const performanceStatistics: PerformanceStatistics = {
  initialRun: 2000,
  mutation: 4000,
  setup: 500,

  // @ts-expect-error check to see if the index signature is missing
  foo: 'bar',
};

const cpuInfo: CpuInformation = {
  baseClock: 2000,
  logicalCores: 8,
  model: 'Intel',

  // @ts-expect-error check to see if the index signature is missing
  foo: 'bar',
};

const osInfo: OSInformation = {
  description: 'Windows',
  platform: 'win32',
  version: '10.0.0',
};

const ramInfo: RamInformation = {
  total: 20000,
};

const systemInformation: SystemInformation = {
  ci: true,
  cpu: cpuInfo,
  os: osInfo,
  ram: ramInfo,

  // @ts-expect-error check to see if the index signature is missing
  foo: 'bar',
};

const openEndLocation: OpenEndLocation = {
  start: { column: 1, line: 1 },

  // @ts-expect-error check to see if the index signature is missing
  foo: 'bar',
};

const test: TestDefinition = {
  id: 'test-1',
  name: 'foo should bar',
  location: openEndLocation,

  // @ts-expect-error check to see if the index signature is missing
  foo: 'bar',
};

const testFiles: TestFileDefinitionDictionary = {
  'test/foo.spec.js': {
    source: 'describe("foo", () => {})',
    tests: [test],
  },
};

export const result: MutationTestResult = {
  files: fileDictionary,
  schemaVersion: '1.3',
  thresholds,
  projectRoot: 'project/root',
  config: {
    testRunner: 'mocha',
    mochaOptions: {
      spec: ['./test/**/*.js'],
    },
  },
  framework: frameworkInformation,
  performance: performanceStatistics,
  system: systemInformation,
  testFiles,

  // @ts-expect-error check to see if the index signature is missing
  aliveMutants: [],
};
