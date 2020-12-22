import { MutantStatus } from 'mutation-testing-report-schema';

export function getContextClassForStatus(status: MutantStatus) {
  switch (status) {
    case 'Killed':
      return 'success';
    case 'NoCoverage':
      return 'caution'; // custom class
    case 'Survived':
      return 'danger';
    case 'Timeout':
      return 'warning';
    case 'Ignored':
    case 'RuntimeError':
    case 'CompileError':
      return 'secondary';
  }
}

export function getEmojiForStatus(status: MutantStatus) {
  switch (status) {
    case 'Killed':
      return '✅';
    case 'NoCoverage':
      return '🙈';
    case 'Ignored':
      return '🤥';
    case 'Survived':
      return '👽';
    case 'Timeout':
      return '⌛';
    case 'RuntimeError':
    case 'CompileError':
      return '💥';
  }
}

export function escapeHtml(unsafe: string) {
  return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export function toAbsoluteUrl(fragment: string): string {
  // Use absolute url because of https://github.com/stryker-mutator/mutation-testing-elements/issues/53
  const url = new URL(window.location.href);
  return new URL(`#${fragment}`, url).href;
}
