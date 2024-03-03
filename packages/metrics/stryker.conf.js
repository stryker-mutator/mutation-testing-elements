import fs from 'fs/promises';

/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions & typeof import('../../stryker.parent.json')}
 */
const config = JSON.parse(await fs.readFile('../../stryker.parent.json', 'utf-8'));

config.dashboard = { module: 'metrics' };
export default config;
