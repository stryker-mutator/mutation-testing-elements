import { expect } from 'chai';
import Ajv from 'ajv';
import { schema } from '../src';

const SCHEMA_NAME = 'http://stryker-mutator.io/report.schema.json';

describe('JsonSchema', () => {
  let schemaValidator: Ajv.Ajv;

  beforeEach(() => {
    schemaValidator = new Ajv({
      missingRefs: 'fail',
      strictKeywords: true,
    });
    schemaValidator.addSchema(schema, SCHEMA_NAME);
  });

  function validate(testResourceFileName: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const report: unknown = require(`../../testResources/${testResourceFileName}.json`);
    return schemaValidator.validate(SCHEMA_NAME, report);
  }

  function actAssertValid(testResourceFileName: string) {
    const valid = validate(testResourceFileName);
    expect(valid, schemaValidator.errorsText(schemaValidator.errors)).true;
  }

  function actAssertInvalid(testResourceFileName: string, expectedError: string) {
    const valid = validate(testResourceFileName);
    expect(valid).false;
    expect(schemaValidator.errorsText()).contain(expectedError);
  }

  it('should validate a report that strictly complies to the schema', () => {
    actAssertValid('strict-report');
  });

  it('should validate a report that loosely complies to the schema', () => {
    actAssertValid('additional-properties-report');
  });

  it('should invalidate a report where "schemaVersion" is missing', () => {
    actAssertInvalid('missing-version-report', "should have required property 'schemaVersion'");
  });

  it('should invalidate a report where thresholds are invalid', () => {
    actAssertInvalid('thresholds/threshold-too-high-report', 'thresholds.high should be <= 100');
    actAssertInvalid('thresholds/threshold-too-low-report', 'thresholds.low should be >= 0');
  });

  it('should invalidate a report when mutant location is missing', () => {
    actAssertInvalid('missing-mutant-location-report', "files['test.js'].mutants[0].location should have required property 'end'");
  });

  it('should validate a report when a test name is missing', () => {
    actAssertInvalid('missing-test-name', ".tests['test-1'] should have required property 'name'");
  });

  it('should validate a report when the framework.name is missing', () => {
    actAssertInvalid('missing-framework-name', "framework should have required property 'name'");
  });

  it('should validate a report when the replacement is missing', () => {
    actAssertValid('missing-replacement-report');
  });
});
