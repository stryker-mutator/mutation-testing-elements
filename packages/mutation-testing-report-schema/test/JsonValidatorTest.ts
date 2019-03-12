import { expect } from 'chai';
import Ajv from 'ajv';
import { schema } from '../src';

const SCHEMA_NAME = 'mutation-testing-report-schema';

describe('JsonSchema', () => {

  it('should return true when the given json file is valid based on the json schema', () => {
    const data = require('../../testResources/valid-mutation-testing-report.json');
    const ajv = new Ajv().addSchema(schema, SCHEMA_NAME);
    const valid = ajv.validate(SCHEMA_NAME, data);

    expect(valid, ajv.errorsText(ajv.errors)).true;
  });

  it('should return false when the given json file is invalid based on the json schema', () => {
    const data = require('../../testResources/invalid-mutation-testing-report.json');
    const ajv = new Ajv().addSchema(schema, SCHEMA_NAME);
    const valid = ajv.validate(SCHEMA_NAME, data);

    expect(ajv.errorsText(ajv.errors)).contain('data should have required property \'schemaVersion\'');
    expect(valid).false;
  });
});
