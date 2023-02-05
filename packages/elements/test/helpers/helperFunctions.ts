import { MutantStatus } from 'mutation-testing-report-schema/api';

export function normalizeWhitespace(pseudoHtml: string) {
  return pseudoHtml.replace(/\s+/g, ' ').trim();
}

export const expectedMutantColors = Object.freeze({
  [MutantStatus.Killed]: 'rgb(220, 252, 231)',
  [MutantStatus.Survived]: 'rgb(254, 226, 226)',
  [MutantStatus.NoCoverage]: 'rgb(255, 237, 213)',
  [MutantStatus.Timeout]: 'rgb(254, 249, 195)',
  [MutantStatus.CompileError]: 'rgb(244, 244, 245)',
  [MutantStatus.RuntimeError]: 'rgb(244, 244, 245)',
  [MutantStatus.Ignored]: 'rgb(244, 244, 245)',
});
