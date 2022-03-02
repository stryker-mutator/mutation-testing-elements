[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fstryker-mutator%2Fmutation-testing-elements%2Fmaster%3Fmodule%3Dmetrics)](https://badge-api.stryker-mutator.io/github.com/stryker-mutator/mutation-testing-elements/master?module=metrics)
[![Build Status](https://github.com/stryker-mutator/mutation-testing-elements/workflows/CI/badge.svg)](https://github.com/stryker-mutator/mutation-testing-elements/actions?query=workflow%3ACI+branch%3Amaster)

# Mutation testing metrics

Utility function to calculate mutation testing metrics..

See [mutant states and metrics on the Stryker website](https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/) for more details about mutation testing metrics.

## Usage example

See the below example (uses TypeScript):

```ts
import { MetricsResult, calculateMutationTestMetrics } from 'mutation-testing-metrics';
import { MutationTestResult } from 'mutation-testing-report-schema';

const mutationTestReport: MutationTestResult = {
  /*... Get a holds of mutation test results somehow */
};

const result: MetricsResult = calculateMutationTestMetrics(mutationTestReport);

console.log('Mutation score', result.metrics.mutationScore);
```

## API Reference

### `calculateMutationTestMetrics` [`(MutationTestResult) => MutationTestMetricsResult`]

Calculates the full mutation test metrics from both the files-under-test as well as (optionally) the test files.

The input is a mutation test result valid according to the [https://github.com/stryker-mutator/mutation-testing-elements/tree/master/packages/report-schema#readme]

Returns A `MutationTestMetricsResult` that contains both the `systemUnderTestMetrics` as well as the `testMetrics`

### `calculateMetrics` [`(MutationTestResult) => MetricsResult`]

Calculates the files-under-test metrics inside of a mutation testing report.

The input is a mutation test result valid according to the [https://github.com/stryker-mutator/mutation-testing-elements/tree/master/packages/report-schema#readme]

### `aggregateResultsByModule` [`(Record<string, MutationTestResult>) => MutationTestResult`]

Aggregates multiple reports together into a single report, grouped by module.

Input: `resultsByModule` The MutationTestResult objects by module name.

### Types

Types are included and documented with TypeScript.

## Use case: merging multiple JSON reports

You can use this script to merge multiple JSON reports together.

```js
const { aggregateResultsByModule } = require('mutation-testing-metrics');
const fs = require('fs');

const packagesRoot = './packages';
const reportsPerModule = fs
  .readdirSync(packagesRoot)
  .map((pkg) => [pkg, `${packagesRoot}/${pkg}/reports/mutation/mutation.json`])
  .filter(([, report]) => fs.existsSync(report))
  .map(([pkg, report]) => [pkg, require(report)])
  .reduce((acc, [pkg, report]) => {
    acc[pkg] = report;
    return acc;
  }, {});

const monoReport = aggregateResultsByModule(reportsPerModule);
fs.writeFileSync('./mono-report.html', reportTemplate(monoReport), 'utf-8');

function reportTemplate(report) {
  const scriptContent = fs.readFileSync(require.resolve('mutation-testing-elements/dist/mutation-test-elements.js'), 'utf-8');

  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <script>
      ${scriptContent}
    </script>
  </head>
  <body>
    <mutation-test-report-app>
      Your browser doesn't support <a href="https://caniuse.com/#search=custom%20elements">custom elements</a>.
      Please use a latest version of an evergreen browser (Firefox, Chrome, Safari, Opera, Edge, etc).
    </mutation-test-report-app>
    <script>
      const app = document.querySelector('mutation-test-report-app');
      app.report = ${escapeHtmlTags(JSON.stringify(report))};
      function updateTheme() {
        document.body.style.backgroundColor = app.theme === 'dark' ? '#222' : '#fff';
      }
      app.addEventListener('theme-changed', updateTheme);
      updateTheme();
    </script>
  </body>
  </html>`;
}
function escapeHtmlTags(json) {
  return json.replace(/</g, '<" + "');
}
```
