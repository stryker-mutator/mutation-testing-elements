import { relative, resolve, dirname } from 'path';
import { promises as fs } from 'fs';
import { compileFromFile } from 'json-schema-to-typescript';

const [, , src, target] = process.argv.filter((arg) => !arg.startsWith('-'));

if (!target) {
  throw new Error(`Usage node ${relative(__dirname, __filename)} schema outFile`);
}

const ts = await compileFromFile(resolve(src), {
  additionalProperties: false,
});
await fs.mkdir(dirname(target), { recursive: true });
await fs.writeFile(target, ts, 'utf-8');
console.log(`✅ ${src} -> ${target}`);
