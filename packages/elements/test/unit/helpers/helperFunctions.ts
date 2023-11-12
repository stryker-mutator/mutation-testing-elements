import type { MutantStatus } from 'mutation-testing-report-schema/api';

export function normalizeWhitespace(pseudoHtml: string) {
  return pseudoHtml.replace(/\s+/g, ' ').trim();
}

export const expectedMutantColors = Object.freeze({
  Killed: 'rgb(220, 252, 231)',
  Survived: 'rgb(254, 226, 226)',
  NoCoverage: 'rgb(255, 237, 213)',
  Timeout: 'rgb(254, 249, 195)',
  CompileError: 'rgb(244, 244, 245)',
  RuntimeError: 'rgb(244, 244, 245)',
  Ignored: 'rgb(244, 244, 245)',
  Pending: 'rgb(244, 244, 245)',
} satisfies Record<MutantStatus, string>);
