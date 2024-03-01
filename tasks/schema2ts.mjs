import { resolve, dirname, relative } from 'path';
import { promises as fs } from 'fs';
import { compileFromFile } from 'json-schema-to-typescript';
import { fileURLToPath } from 'url';

const [, , src, target] = process.argv.filter((arg) => !arg.startsWith('-'));

if (!target) {
  const fileName = fileURLToPath(import.meta.url);
  throw new Error(`Usage node ${relative(process.cwd(), fileName)} schema.json out.ts`);
}

const ts = await compileFromFile(resolve(src), {
  additionalProperties: false,
});
await fs.mkdir(dirname(target), { recursive: true });
await fs.writeFile(target, ts, 'utf-8');
console.log(`✅ ${src} -> ${target}`);
