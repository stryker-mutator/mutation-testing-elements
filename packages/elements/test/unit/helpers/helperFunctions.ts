import type { MutantStatus } from 'mutation-testing-report-schema/api';
import colors from 'tailwindcss/colors.js';

export function normalizeWhitespace(pseudoHtml: string) {
  return pseudoHtml.replace(/\s+/g, ' ').trim();
}

export const expectedMutantColors = Object.freeze({
  Killed: colors.green['100'],
  Survived: colors.red['100'],
  NoCoverage: colors.orange['100'],
  Timeout: colors.yellow['100'],
  CompileError: colors.zinc['100'],
  RuntimeError: colors.zinc['100'],
  Ignored: colors.zinc['100'],
  Pending: colors.zinc['100'],
} satisfies Record<MutantStatus, string>);
