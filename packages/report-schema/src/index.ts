export * from '../src-generated/schema.js';

import schema from './mutation-testing-report-schema.json' with { type: 'json' };

export type SchemaType = typeof schema;

export { schema };
