
[![Build Status](https://github.com/stryker-mutator/mutation-testing-elements/workflows/CI/badge.svg)](https://github.com/stryker-mutator/mutation-testing-elements/actions?query=workflow%3ACI+branch%3Amaster)

# Mutation testing elements schema

The json schema for mutation testing elements.

The schema can be found [here](https://github.com/stryker-mutator/mutation-testing-elements/blob/master/packages/mutation-testing-report-schema/src/mutation-testing-report-schema.json). 

## JavaScript

Install it with npm like this:

```sh
$ npm i mutation-testing-report-schema
```

Use it from typescript or js (with babel)

```ts
import { schema } from 'mutation-testing-elements-schema';
```

For example, use [AJV](https://github.com/epoberezkin/ajv#ajv-another-json-schema-validator):

```ts
const schemaValidator = new Ajv();
schemaValidator.addSchema(schema, 'mutation-testing-report-schema');
schemaValidator.validate('mutation-testing-report-schema', { /*.. report as json ...*/ });
```

## Other languages

Download the schema using https://www.unpkg.com/mutation-testing-report-schema@VERSION/dist/src/mutation-testing-report-schema.json

For the current version, see package.json.
