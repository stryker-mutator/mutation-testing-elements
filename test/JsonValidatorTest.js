var expect = require('chai').expect
var Ajv = require('ajv');
var schema = require('../mutation-testing-report-schema.json')

describe('JsonSchema', function () {

    var ajv = new Ajv().addSchema(schema, 'mutation-testing-report-schema');

    it('should return true when the given json file is valid based on the json schema', function () {
        var data = require('./resources/valid-mutation-testing-report.json');
        var valid = ajv.validate('mutation-testing-report-schema', data);

        expect(valid).to.be.true;
    });

    it("should return false when the given json file is invalid based on the json schema", function() {
        var data = require('./resources/invalid-mutation-testing-report.json');
        var valid = ajv.validate('mutation-testing-report-schema', data);

        expect(ajv.errorsText(ajv.errors)).to.contain("data should have required property 'health'");
        expect(valid).to.be.false;
    });
});