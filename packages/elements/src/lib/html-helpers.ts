import { isServer } from 'lit';
import { TestStatus } from 'mutation-testing-metrics';
import type { MutantStatus, OpenEndLocation } from 'mutation-testing-report-schema/api';

import { DRAWER_HALF_OPEN_SIZE } from '../components/drawer/drawer.component.js';
import { renderEmoji } from '../components/drawer-mutant/util.js';

export function getContextClassForStatus(status: MutantStatus) {
  switch (status) {
    case 'Killed':
      return 'success';
    case 'NoCoverage':
      return 'caution';
    case 'Survived':
      return 'danger';
    case 'Timeout':
      return 'warning';
    case 'Ignored':
    case 'RuntimeError':
    case 'Pending':
    case 'CompileError':
      return 'secondary';
  }
}

export function getContextClassForTestStatus(status: TestStatus) {
  switch (status) {
    case TestStatus.Killing:
      return 'success';
    case TestStatus.Covering:
      return 'warning';
    case TestStatus.NotCovering:
      return 'caution';
  }
}

export function getEmojiForTestStatus(status: TestStatus) {
  switch (status) {
    case TestStatus.Killing:
      return renderEmoji('✅', status);
    case TestStatus.Covering:
      return renderEmoji('☂', status);
    case TestStatus.NotCovering:
      return renderEmoji('🌧', status);
  }
}

export function getEmojiForStatus(status: MutantStatus) {
  switch (status) {
    case 'Killed':
      return renderEmoji('✅', status);
    case 'NoCoverage':
      return renderEmoji('🙈', status);
    case 'Ignored':
      return renderEmoji('🤥', status);
    case 'Survived':
      return renderEmoji('👽', status);
    case 'Timeout':
      return renderEmoji('⏰', status);
    case 'Pending':
      return renderEmoji('⌛', status);
    case 'RuntimeError':
    case 'CompileError':
      return renderEmoji('💥', status);
  }
}

export function escapeHtml(unsafe: string) {
  return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export function toAbsoluteUrl(...fragments: string[]): string {
  const joinedFragments = fragments.filter(Boolean).join('/');
  if (isServer) {
    return `#${joinedFragments}`;
  } else {
    // Use absolute url because of https://github.com/stryker-mutator/mutation-testing-elements/issues/53
    const url = new URL(window.location.href);
    return new URL(`#${joinedFragments}`, url).href;
  }
}

export function plural(items: unknown[]): string {
  if (items.length > 1) {
    return 's';
  }
  return '';
}

export function describeLocation({ fileName, location }: { fileName: string; location?: OpenEndLocation | undefined }) {
  return fileName ? `${fileName}${location ? `:${location.start.line}:${location.start.column}` : ''}` : '';
}

export function scrollToCodeFragmentIfNeeded(el: Element | null) {
  if (el && !isElementInViewport(el)) {
    el.scrollIntoView({
      block: 'center',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }
}

function isElementInViewport(el: Element) {
  const { top, bottom } = el.getBoundingClientRect();

  return top >= 0 && bottom <= (window.innerHeight || document.documentElement.clientHeight) - DRAWER_HALF_OPEN_SIZE;
}
