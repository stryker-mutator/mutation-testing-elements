import type { TemplateResult } from 'lit';
import { html, nothing } from 'lit';

export const renderDetailLine = (title: string, content: string | TemplateResult) =>
  html`<li title=${title || nothing} class="my-3 rounded-sm bg-white px-2 py-3 shadow-sm">${content}</li>`;

// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- we want to coalesce on empty string
export const renderSummaryLine = (content: string | TemplateResult, title?: string) => html`<p title=${title || nothing}>${content}</p>`;

export const renderSummaryContainer = (content: TemplateResult) => html`<div class="mb-6 mr-6 mt-2 flex flex-col gap-4">${content}</div>`;

/**
 * Wrap the given emoji in an accessible-friendly span
 */
export const renderEmoji = (emoji: string, label: string) => html`<span role="img" aria-label="${label}">${emoji}</span>`;
