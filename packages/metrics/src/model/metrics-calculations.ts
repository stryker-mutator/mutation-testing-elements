import { MutantStatus } from "mutation-testing-report-schema";
import { MetricsResult, MutantModel, TestMetrics, TestModel, TestStatus } from ".";
import { MutationMetrics } from "./mutation-metrics";

const DEFAULT_SCORE = NaN;

export function countDirectoryMetric(metric: MetricsResult): MutationMetrics {
  const count = (status: keyof MutationMetrics) => metric.childResults.reduce((acc, curr) => acc + curr.metrics[status], 0);
  const pending = count('pending');
  const killed = count('killed');
  const timeout = count('timeout');
  const survived = count('survived');
  const noCoverage = count('noCoverage');
  const runtimeErrors = count('runtimeErrors');
  const compileErrors = count('compileErrors');
  const ignored = count('ignored');
  const totalDetected = timeout + killed;
  const totalUndetected = survived + noCoverage;
  const totalCovered = totalDetected + survived;
  const totalValid = totalUndetected + totalDetected;
  const totalInvalid = runtimeErrors + compileErrors;
  return {
    pending,
    killed,
    timeout,
    survived,
    noCoverage,
    runtimeErrors,
    compileErrors,
    ignored,
    totalDetected,
    totalUndetected,
    totalCovered,
    totalValid,
    totalInvalid,
    mutationScore: totalValid > 0 ? (totalDetected / totalValid) * 100 : DEFAULT_SCORE,
    totalMutants: totalValid + totalInvalid + ignored + pending,
    mutationScoreBasedOnCoveredCode: totalValid > 0 ? (totalDetected / totalCovered) * 100 || 0 : DEFAULT_SCORE,
  };
}

export function countFileMetrics(mutants: MutantModel[]): MutationMetrics {
  const count = (status: MutantStatus) => mutants.reduce((acc, curr) => acc + (curr.status === status ? 1 : 0), 0);
  const pending = count(MutantStatus.Pending);
  const killed = count(MutantStatus.Killed);
  const timeout = count(MutantStatus.Timeout);
  const survived = count(MutantStatus.Survived);
  const noCoverage = count(MutantStatus.NoCoverage);
  const runtimeErrors = count(MutantStatus.RuntimeError);
  const compileErrors = count(MutantStatus.CompileError);
  const ignored = count(MutantStatus.Ignored);
  const totalDetected = timeout + killed;
  const totalUndetected = survived + noCoverage;
  const totalCovered = totalDetected + survived;
  const totalValid = totalUndetected + totalDetected;
  const totalInvalid = runtimeErrors + compileErrors;
  return {
    pending,
    killed,
    timeout,
    survived,
    noCoverage,
    runtimeErrors,
    compileErrors,
    ignored,
    totalDetected,
    totalUndetected,
    totalCovered,
    totalValid,
    totalInvalid,
    mutationScore: totalValid > 0 ? (totalDetected / totalValid) * 100 : DEFAULT_SCORE,
    totalMutants: totalValid + totalInvalid + ignored + pending,
    mutationScoreBasedOnCoveredCode: totalValid > 0 ? (totalDetected / totalCovered) * 100 || 0 : DEFAULT_SCORE,
  };
}

export function countTestFileMetrics(testFile: TestModel[]): TestMetrics {
  const count = (status: TestStatus) => testFile.reduce((acc, curr) => acc + (curr.status === status ? 1 : 0), 0);

  return {
    total: testFile.length,
    killing: count(TestStatus.Killing),
    covering: count(TestStatus.Covering),
    notCovering: count(TestStatus.NotCovering),
  };
}

export function countTestDirectoryMetric(){

}