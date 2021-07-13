import { expect } from 'chai';
import { schema } from '../../src';

describe('package exports', () => {
  it('should export "schema"', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
    const actualSchema = require('../../..').schema;
    expect(schema).eq(actualSchema);
  });
});
