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
