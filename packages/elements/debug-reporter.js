// @ts-check
import { declareValuePlugin, PluginKind } from '@stryker-mutator/api/plugin';
import fs from 'fs';

export const strykerPlugins = [
  declareValuePlugin(PluginKind.Reporter, 'debug', {
    onDryRunCompleted({ result }) {
      fs.writeFileSync('./mutation-coverage.json', JSON.stringify(result.mutantCoverage, null, 2));
    },
  }),
];
