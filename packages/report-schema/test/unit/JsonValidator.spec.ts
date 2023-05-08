import { expect } from 'chai';
import Ajv from 'ajv';
import { schema } from '../../src';

const SCHEMA_NAME = 'http://stryker-mutator.io/report.schema.json';

describe('JsonSchema', () => {
  let schemaValidator: Ajv;

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

  function validate(testResourceFileName: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const report: unknown = require(`../../../testResources/${testResourceFileName}.json`);
    return schemaValidator.validate(SCHEMA_NAME, report);
  }

  function actAssertValid(testResourceFileName: string) {
    const valid = validate(testResourceFileName);
    expect(valid, schemaValidator.errorsText(schemaValidator.errors)).true;
  }

  function actAssertInvalid(testResourceFileName: string, ...expectedErrors: string[]) {
    const valid = validate(testResourceFileName);
    expect(valid).false;
    for (const expectedError of expectedErrors) {
      expect(schemaValidator.errorsText()).contain(expectedError);
    }
  }

  it('should validate a v1 report that strictly complies to the schema', () => {
    actAssertValid('strict-report-v1');
  });

  it('should validate a v2 report that strictly complies to the schema', () => {
    actAssertValid('strict-report-v2');
  });

  it('should validate a report that loosely complies to the schema', () => {
    actAssertValid('additional-properties-report');
  });

  it('should invalidate a report where "schemaVersion" is missing', () => {
    actAssertInvalid('missing-version-report', "must have required property 'schemaVersion'");
  });

  it('should invalidate a report where thresholds are invalid', () => {
    actAssertInvalid('thresholds/threshold-too-high-report', 'thresholds/high must be <= 100');
    actAssertInvalid('thresholds/threshold-too-low-report', 'thresholds/low must be >= 0');
  });

  it('should invalidate a report when mutant location is missing', () => {
    actAssertInvalid('missing-mutant-location-report', "files/test.js/mutants/0/location must have required property 'end'");
  });

  it('should invalidate a report when a test name is missing', () => {
    actAssertInvalid('missing-test-name', "data/testFiles/test~1foo.spec.js/tests/0 must have required property 'name'");
  });

  it('should invalidate a report when the framework/name is missing', () => {
    actAssertInvalid('missing-framework-name', "framework must have required property 'name'");
  });

  it('should invalidate a report when the tests in testFiles are missing', () => {
    actAssertInvalid('missing-tests', "data/testFiles/test~1foo.spec.js must have required property 'tests'");
  });

  it('should invalidate a report when system/ci is missing', () => {
    actAssertInvalid('missing-system-ci', "data/system must have required property 'ci'");
  });

  it('should invalidate a report when system/cpu/logicalCores is missing', () => {
    actAssertInvalid('missing-system-cpu-logical-cores', "data/system/cpu must have required property 'logicalCores'");
  });

  it('should invalidate a report when system/os/platform is missing', () => {
    actAssertInvalid('missing-system-os-platform', "data/system/os must have required property 'platform'");
  });

  it('should invalidate a report when system/ram/total is missing', () => {
    actAssertInvalid('missing-system-ram-total', "data/system/ram must have required property 'total'");
  });

  it('should invalidate a report when system/os/platform is missing', () => {
    actAssertInvalid('missing-system-os-platform', "data/system/os must have required property 'platform'");
  });

  it('should invalidate a report when performance/* is missing', () => {
    actAssertInvalid(
      'missing-performance-fields',
      "data/performance must have required property 'setup'",
      "data/performance must have required property 'initialRun'",
      "data/performance must have required property 'mutation'"
    );
  });

  it('should validate a report when the replacement is missing', () => {
    actAssertValid('missing-replacement-report');
  });

  it('should validate a report when testFiles is missing', () => {
    actAssertValid('missing-test-files');
  });

  it('should validate a report when end is missing in test location', () => {
    actAssertValid('missing-end-location');
  });

  it('should validate a report when imageUrl is a data URL', () => {
    actAssertValid('data-url');
  });
});
