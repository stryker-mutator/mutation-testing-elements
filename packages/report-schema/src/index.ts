export * from '../src-generated/schema.js';
import fs from 'fs';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type SchemaType = typeof import('./mutation-testing-report-schema.json');

export const schema: SchemaType = JSON.parse(fs.readFileSync(new URL('./mutation-testing-report-schema.json', import.meta.url), 'utf-8'));
