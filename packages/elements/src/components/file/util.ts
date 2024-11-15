import type { TemplateResult } from 'lit';
import { html, nothing, svg } from 'lit';
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

// To edit, I recommend opening the SVG in a tool like Inkscape
const circleSvgPath = 'M 0,5 C 0,-1.66 10,-1.66 10,5 10,7.76 7.76,10 5,10 2.24,10 0,7.76 0,5 Z';
// Triangle with curve paths of 0, so it has the same number of path elements as the circle, which is needed for animation
const triangleSvgPath = 'M 0,0 C 0,0 10,0 10,0 10,0 5,10 5,10 5,10 0,0 0,0 Z';
// Fancy cubic bezier curve for the animation. Same as `transition-*` in tailwind
const animationCurve = '0.4 0 0.2 1';

const pathF = (from: string, to: string, strokeOpacity: number) =>
  svg`<path stroke-opacity="${strokeOpacity}" class="transition-stroke-opacity stroke-gray-800" d="${to}">
    <animate values="${from};${to}" attributeName="d" dur="0.2s" begin="indefinite" calcMode="spline" keySplines="${animationCurve}" />
  </path>`;

export const triangle = pathF(circleSvgPath, triangleSvgPath, 1);
export const circle = pathF(triangleSvgPath, circleSvgPath, 0);

/**
 * Animate a svg element that has a path.animate child
 */
export function beginElementAnimation(root: ParentNode | undefined, prop: string, value: string) {
  const el = root?.querySelector<SVGAnimateElement>(`[${prop}="${encodeURIComponent(value)}"] path animate`);
  el?.beginElement();
}
