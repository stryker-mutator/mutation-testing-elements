import { MutantStatus } from "mutation-testing-report-schema";

export function normalizeWhitespace(pseudoHtml: string) {
  return pseudoHtml.replace(/\s+/g, ' ').trim();
}

export const expectedMutantColors = Object.freeze({
  [MutantStatus.Killed]: 'rgb(40, 167, 69)',
  [MutantStatus.Survived]: 'rgb(220, 53, 69)',
  [MutantStatus.NoCoverage]: 'rgb(253, 126, 20)',
  [MutantStatus.Timeout]: 'rgb(255, 193, 7)',
  [MutantStatus.CompileError]: 'rgb(108, 117, 125)',
  [MutantStatus.RuntimeError]: 'rgb(108, 117, 125)'
});
