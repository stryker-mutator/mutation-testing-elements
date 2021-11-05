/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-var-requires */
// See https://github.com/bcherny/json-schema-to-typescript/issues/358

const path = require('path');
const { promises: fs } = require('fs');
const schema2ts = require('json-schema-to-typescript');

const [, , src, target] = process.argv.filter((arg) => !arg.startsWith('-'));

if (!target) {
  throw new Error(`Usage node ${path.relative(__dirname, __filename)} schema outFile`);
}

async function main() {
  const input = require(path.resolve(src));
  const transformed = transform(input);
  const ts = await schema2ts.compile(transformed, path.basename(src), {
    enableConstEnums: false,
  });
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, ts, 'utf-8');
  console.log(`✅ ${src} -> ${target}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

/**
 * @param {object} input
 * @returns {object}
 */
function transform(input) {
  if (input.$ref) {
    return input;
  }

  switch (input.type) {
    case 'object':
      return {
        ...input,
        ...('properties' in input ? { properties: transformProperties(input.properties) } : undefined),
        ...(input.definitions ? { definitions: transformProperties(input.definitions) } : undefined),
        ...(typeof input.additionalProperties === 'undefined'
          ? { additionalProperties: false }
          : typeof input.additionalProperties === 'object'
          ? { additionalProperties: transform(input.additionalProperties) }
          : undefined),
        ...(input.title === 'MutantStatus' ? { tsEnumNames: input.enum } : undefined),
      };
    case 'array':
      return {
        ...input,
        ...(input.items ? { items: transform(input.items) } : undefined),
      };
    case 'string':
      return {
        ...input,
        ...(input.title === 'MutantStatus' ? { tsEnumNames: input.enum } : undefined),
      };
    case 'boolean':
    case 'integer':
    case 'number':
      return input;
    case undefined:
      throw new Error(`Missing "type" in ${JSON.stringify(input, null, 2)}`);
    default:
      throw new Error(`Unsupported type ${String(input.type)} in ${JSON.stringify(input, null, 2)}`);
  }
}

/**
 *
 * @param {object} properties
 */
function transformProperties(properties) {
  return Object.entries(properties).reduce((acc, [key, val]) => {
    acc[key] = transform(val);
    return acc;
  }, {});
}
