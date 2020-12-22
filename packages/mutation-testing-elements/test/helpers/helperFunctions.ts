export function normalizeWhitespace(pseudoHtml: string) {
  return pseudoHtml.replace(/\s+/g, ' ').trim();
}

export const expectedMutantColors = Object.freeze({
  Killed: 'rgb(40, 167, 69)',
  Survived: 'rgb(220, 53, 69)',
  NoCoverage: 'rgb(253, 126, 20)',
  Timeout: 'rgb(255, 193, 7)',
  CompileError: 'rgb(108, 117, 125)',
  RuntimeError: 'rgb(108, 117, 125)',
  Ignored: 'rgb(108, 117, 125)',
});
