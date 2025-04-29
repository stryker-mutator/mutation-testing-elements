import type { MutantStatus } from 'mutation-testing-report-schema/api';
import colors from 'tailwindcss/colors.js';

export function normalizeWhitespace(pseudoHtml: string) {
  return pseudoHtml.replace(/\s+/g, ' ').trim();
}

export const expectedMutantColors = Object.freeze({
  Killed: fixCssVarPercentage(colors.green['100']),
  Survived: fixCssVarPercentage(colors.red['100']),
  NoCoverage: fixCssVarPercentage(colors.orange['100']),
  Timeout: fixCssVarPercentage(colors.yellow['100']),
  CompileError: fixCssVarPercentage(colors.zinc['100']),
  RuntimeError: fixCssVarPercentage(colors.zinc['100']),
  Ignored: fixCssVarPercentage(colors.zinc['100']),
  Pending: fixCssVarPercentage(colors.zinc['100']),
} satisfies Record<MutantStatus, string>);

/**
 * Replaces `oklch(97.3%` with `oklch(0.973`. The variable is defined as a %, but the browser reads it as a percentile number
 */
export function fixCssVarPercentage(value: string) {
  const match = /oklch\(((\d+)(\.\d)?%)/.exec(value);

  if (match) {
    const updatedCssVar = value.replace(match[1], `0.${match[2]}${match[3]?.replace('.', '') ?? ''}`);
    return updatedCssVar;
  }
  return value;
}
