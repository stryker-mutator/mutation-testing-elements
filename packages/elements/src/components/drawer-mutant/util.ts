import { html, nothing, TemplateResult } from 'lit';

export const renderDetailLine = (title: string, content: string | TemplateResult) =>
  html`<li title=${title || nothing} class="my-3 rounded bg-white py-3 px-2 shadow">${content}</li>`;

export const renderSummaryLine = (content: string | TemplateResult, title?: string) => html`<p title=${title || nothing}>${content}</p>`;

export const renderSummaryContainer = (content: TemplateResult) => html`<div class="mb-6 mt-2 mr-6 flex flex-col gap-4">${content}</div>`;

/**
 * Wrap the given emoji in an accessible-friendly span
 */
export const renderEmoji = (emoji: string, label: string) => html`<span role="img" aria-label="${label}">${emoji}</span>`;
