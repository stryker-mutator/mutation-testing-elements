import ajvModule from 'ajv';
import { expect } from 'chai';
import fs from 'fs/promises';

import { schema } from '../../src/index.js';

const Ajv = ajvModule.default;

const SCHEMA_NAME = 'http://stryker-mutator.io/report.schema.json';

describe('JsonSchema', () => {
  let schemaValidator: InstanceType<typeof Ajv>;

  beforeEach(() => {
    schemaValidator = new Ajv({
      strict: true,
      allErrors: true,
      formats: {
        uri: true,
      },
    });
    schemaValidator.addSchema(schema, SCHEMA_NAME);
  });

  async function validate(testResourceFileName: string) {
    const report: unknown = JSON.parse(await fs.readFile(new URL(`../../../testResources/${testResourceFileName}.json`, import.meta.url), 'utf-8'));
    return schemaValidator.validate(SCHEMA_NAME, report);
  }

  async function actAssertValid(testResourceFileName: string) {
    const valid = await validate(testResourceFileName);
    expect(valid, schemaValidator.errorsText(schemaValidator.errors)).true;
  }

  async function actAssertInvalid(testResourceFileName: string, ...expectedErrors: string[]) {
    const valid = await validate(testResourceFileName);
    expect(valid).false;
    for (const expectedError of expectedErrors) {
      expect(schemaValidator.errorsText()).contain(expectedError);
    }
  }

  it('should validate a v1 report that strictly complies to the schema', async () => {
    await actAssertValid('strict-report-v1');
  });

  it('should validate a v2 report that strictly complies to the schema', async () => {
    await actAssertValid('strict-report-v2');
  });

  it('should validate a report that loosely complies to the schema', async () => {
    await actAssertValid('additional-properties-report');
  });

  it('should invalidate a report where "schemaVersion" is missing', async () => {
    await actAssertInvalid('missing-version-report', "must have required property 'schemaVersion'");
  });

  it('should invalidate a report where thresholds are invalid', async () => {
    await actAssertInvalid('thresholds/threshold-too-high-report', 'thresholds/high must be <= 100');
    await actAssertInvalid('thresholds/threshold-too-low-report', 'thresholds/low must be >= 0');
  });

  it('should invalidate a report when mutant location is missing', async () => {
    await actAssertInvalid('missing-mutant-location-report', "files/test.js/mutants/0/location must have required property 'end'");
  });

  it('should invalidate a report when a test name is missing', async () => {
    await actAssertInvalid('missing-test-name', "data/testFiles/test~1foo.spec.js/tests/0 must have required property 'name'");
  });

  it('should invalidate a report when the framework/name is missing', async () => {
    await actAssertInvalid('missing-framework-name', "framework must have required property 'name'");
  });

  it('should invalidate a report when the tests in testFiles are missing', async () => {
    await actAssertInvalid('missing-tests', "data/testFiles/test~1foo.spec.js must have required property 'tests'");
  });

  it('should invalidate a report when system/ci is missing', async () => {
    await actAssertInvalid('missing-system-ci', "data/system must have required property 'ci'");
  });

  it('should invalidate a report when system/cpu/logicalCores is missing', async () => {
    await actAssertInvalid('missing-system-cpu-logical-cores', "data/system/cpu must have required property 'logicalCores'");
  });

  it('should invalidate a report when system/os/platform is missing', async () => {
    await actAssertInvalid('missing-system-os-platform', "data/system/os must have required property 'platform'");
  });

  it('should invalidate a report when system/ram/total is missing', async () => {
    await actAssertInvalid('missing-system-ram-total', "data/system/ram must have required property 'total'");
  });

  it('should invalidate a report when system/os/platform is missing', async () => {
    await actAssertInvalid('missing-system-os-platform', "data/system/os must have required property 'platform'");
  });

  it('should invalidate a report when performance/* is missing', async () => {
    await actAssertInvalid(
      'missing-performance-fields',
      "data/performance must have required property 'setup'",
      "data/performance must have required property 'initialRun'",
      "data/performance must have required property 'mutation'",
    );
  });

  it('should validate a report when the replacement is missing', async () => {
    await actAssertValid('missing-replacement-report');
  });

  it('should validate a report when testFiles is missing', async () => {
    await actAssertValid('missing-test-files');
  });

  it('should validate a report when end is missing in test location', async () => {
    await actAssertValid('missing-end-location');
  });

  it('should validate a report when imageUrl is a data URL', async () => {
    await actAssertValid('data-url');
  });
});
