import { html, nothing, TemplateResult } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

export function renderDots(dots: typeof nothing | TemplateResult[], finalDots: typeof nothing | TemplateResult[]) {
  if (dots === nothing && finalDots === nothing) {
    return nothing;
  } else {
    return html`<span class="ml-1 flex flex-row items-center">${dots}${finalDots}</span>`;
  }
}

export function renderLine(line: string, dots: TemplateResult | typeof nothing) {
  return html`<tr class="line"
    ><td class="line-number"></td><td class="line-marker"></td><td class="code flex"><span>${unsafeHTML(line)}</span>${dots}</td></tr
  >`;
}
