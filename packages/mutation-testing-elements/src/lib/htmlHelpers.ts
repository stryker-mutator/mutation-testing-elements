import { MutantStatus } from 'mutation-testing-report-schema';

export function getContextClassForStatus(status: MutantStatus) {
  switch (status) {
    case MutantStatus.Killed:
      return 'success';
    case MutantStatus.NoCoverage:
      return 'caution'; // custom class
    case MutantStatus.Survived:
      return 'danger';
    case MutantStatus.Timeout:
      return 'warning';
    case MutantStatus.Ignored:
    case MutantStatus.RuntimeError:
    case MutantStatus.CompileError:
      return 'secondary';
  }
}

export function getEmojiForStatus(status: MutantStatus) {
  switch (status) {
    case MutantStatus.Killed:
      return '✅';
    case MutantStatus.NoCoverage:
      return '🙈';
    case MutantStatus.Ignored:
      return '🤥';
    case MutantStatus.Survived:
      return '👽';
    case MutantStatus.Timeout:
      return '⌛';
    case MutantStatus.RuntimeError:
    case MutantStatus.CompileError:
      return '💥';
  }
}

export function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function toAbsoluteUrl(fragment: string): string {
  // Use absolute url because of https://github.com/stryker-mutator/mutation-testing-elements/issues/53
  const url = new URL(window.location.href);
  return new URL(`#${fragment}`, url).href;
}
