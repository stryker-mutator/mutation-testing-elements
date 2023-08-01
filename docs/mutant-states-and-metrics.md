---
title: Mutant states and metrics
custom_edit_url: https://github.com/stryker-mutator/mutation-testing-elements/edit/master/docs/mutant-states-and-metrics.md
---

This page should shed some light on the different outcomes a mutant can have and the different metrics you'll find in any given mutation testing report.

_Are you new to mutation testing, see [what is mutation testing?](https://stryker-mutator.io/docs/)_.

## Mutant states

A mutant can have one of the following states:

- **Pending**
  The mutant has been generated, but not run yet. This is a temporary state and will be changed once the mutant has been tested.
- **Killed**
  When at least one test failed while this mutant was active, the mutant is killed. This is what you want, good job!
- **Survived**
  When all tests passed while this mutant was active, the mutant survived. You're missing a test for it.
- **No coverage**
  The mutant isn't covered by one of your tests and survived as a result.
- **Timeout**
  The running of tests with this mutant active resulted in a timeout.
  For example, the mutant resulted in an infinite loop in your code.
  Don't spend too much attention to this mutant.
  It is counted as "detected". The logic here is that if this mutant were to be injected in your code,
  your CI build would detect it because the tests will never complete.
- **Runtime error**
  The running of the tests resulted in an error (rather than a failed test).
  This can happen when the test runner fails. For example, when a test runner throws an `OutOfMemoryError` or for dynamic languages where the mutant resulted in unparsable code.
  Don't spend too much attention looking at this mutant. It is not represented in your mutation score.
- **Compile error**
  The mutant caused a compile error.
  This can happen in compiled languages.
  Don't spend too much attention looking at this mutant.
  It is not represented in your mutation score.
- **Ignored**
  The mutant wasn't tested because it is ignored. Either by user action, or for another reason.
  This will not count against your mutation score but will show up in reports.

## Metrics

Based on these states, we can calculate the following metrics:

- **Detected** `killed + timeout`  
  The number of mutants detected by your tests.
- **Undetected** `survived + no coverage`  
  The number of mutants that are not detected by your tests.
- **Covered** `detected + survived`  
  The number of mutants that your tests produce code coverage for.
- **Valid** `detected + undetected`  
  The number of valid mutants. They didn't result in a compile error or runtime error.
- **Invalid** `runtime errors + compile errors`  
  The number of invalid mutants. They couldn't be tested because they produce either a compile error or a runtime error.
- **Total mutants** `valid + invalid + ignored + pending`  
  All mutants.
- **Mutation score** `detected / valid * 100`  
  The total percentage of mutants that were detected. The higher, the better!
- **Mutation score based on covered code** `detected / covered * 100`  
  The total percentage of mutants that were detected based on the code coverage results.

## Test states and metrics

A _test_ can also have state with regards to mutation testing.

- **Killing**
  The test is killing at least one mutant. This is what you want.
- **Covering**
  The test is covering mutants, but not killing any of them. The coverage information should be available per test to provide this test state.
- **Not covering**
  The test is not even covering any mutants (and thus not killing any of them).
- **Total** `not covering + covering + killing`
  Total number of tests.
