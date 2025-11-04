// @ts-nocheck
import config from '../../stryker.parent.json' with { type: 'json' };

delete config.buildCommand;
delete config.mochaOptions;

config.dashboard = { module: 'elements' };
config.testRunner = 'vitest';

export default config;
