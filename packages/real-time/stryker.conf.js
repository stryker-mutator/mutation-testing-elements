import fs from 'fs/promises';

/**
 * @type {Partial<import('@stryker-mutator/api/core').PartialStrykerOptions>}
 */
const config = JSON.parse(await fs.readFile('../../stryker.parent.json', 'utf-8'));

config.dashboard = { module: 'real-time' };
export default config;
