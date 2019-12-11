[![Build Status](https://travis-ci.org/stryker-mutator/mutation-testing-elements.svg?branch=master)](https://travis-ci.org/stryker-mutator/mutation-testing-elements)

# Mutation testing metrics

Utility function to calculate mutation testing metrics..

See [mutant states and metrics in the Stryker handbook](https://github.com/stryker-mutator/stryker-handbook/blob/master/mutant-states-and-metrics.md#readme) for more details about mutation testing metrics.

## Usage example

See the below example (uses TypeScript):

```ts
import { MetricsResult, calculateMetrics } from 'mutation-testing-metrics';
import { MutationTestResult } from 'mutation-testing-report-schema';

const mutationTestReport: MutationTestResult = { /*... Get a holds of mutation test results somehow */ };

const result: MetricsResult = calculateMetrics(mutationTestReport);

console.log('Mutation score', result.metrics.mutationScore)
```
## API Reference

### `calculateMetrics` [`(MutationTestResult) => MetricsResult`]

Calculates the metrics for a MutationTestResult. This result must be valid according to the [https://github.com/stryker-mutator/mutation-testing-elements/tree/master/packages/mutation-testing-report-schema#readme].


### `MetricsResult`

A `MetricsResult` has a `metrics` property containing the following metrics: 
 
* `killed`
* `timeout`
* `survived`
* `noCoverage`
* `runtimeErrors`
* `compileErrors`
* `ignored`
* `totalDetected`
* `totalUndetected`
* `totalValid`
* `totalInvalid`
* `mutationScore`
* `totalMutants`
* `mutationScoreBasedOnCoveredCode`

It optionally has a `file` property which points to a `FileResult` (mutation-testing-report-schema) or one or more `childResults` 
if it represents a directory.