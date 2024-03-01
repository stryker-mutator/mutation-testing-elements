export * from '../src-generated/schema.js';
import fs from 'fs';
import type schemaType from './mutation-testing-report-schema.json';

export const schema: typeof schemaType = JSON.parse(fs.readFileSync(new URL('./mutation-testing-report-schema.json', import.meta.url), 'utf-8'));
