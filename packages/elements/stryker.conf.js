import fs from 'fs/promises';

/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions & typeof import('../../stryker.parent.json')}
 */
const config = JSON.parse(await fs.readFile('../../stryker.parent.json', 'utf-8'));

// @ts-expect-error removing gives error from parent.json type
delete config.buildCommand;
// @ts-expect-error removing gives error from parent.json type
delete config.mochaOptions;

config.dashboard = { module: 'elements' };
config.testRunner = 'vitest';

export default config;
