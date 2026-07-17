import { type AnserJsonEntry, ansiToJson } from 'anser';
import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type ClassInfo, classMap } from 'lit/directives/class-map.js';
import { map } from 'lit/directives/map.js';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';

import { BaseElement } from '../base-element.js';

/**
 * Renders a string that may contain ANSI escape codes.
 */
@customElement('mte-ansi-text')
export class AnsiTextComponent extends BaseElement {
  @property()
  declare public text: string;

  public render() {
    if (!this.text) return nothing;

    const chunks = ansiToJson(this.text, { json: true, remove_empty: true });

    // Render in monospace when the text looks like it came from a terminal
    const isProbablyAnsi = chunks.length > 1 || chunks.some((chunk) => chunk.fg || chunk.bg || chunk.decoration);

    return html`<span class=${classMap({ 'whitespace-pre-wrap': true, 'font-mono': isProbablyAnsi })}
      >${map(chunks, (chunk) => {
        const [classInfo, styleInfo] = toClassAndStyle(chunk);
        if (Object.keys(classInfo).length === 0 && Object.keys(styleInfo).length === 0) {
          return chunk.content;
        }
        return html`<span class=${classMap(classInfo)} style=${styleMap(styleInfo)}>${chunk.content}</span>`;
      })}</span
    >`;
  }
}

/**
 * Splits an ANSI chunk into a {@link ClassInfo} and {@link StyleInfo}.
 */
function toClassAndStyle(chunk: AnserJsonEntry): [ClassInfo, StyleInfo] {
  const styleInfo: StyleInfo = Object.create(null);
  if (chunk.fg) {
    styleInfo.color = `rgb(${chunk.fg})`;
  }
  if (chunk.bg) {
    styleInfo['background-color'] = `rgb(${chunk.bg})`;
  }

  const classInfo: ClassInfo = Object.create(null);
  for (const decoration of chunk.decorations) {
    switch (decoration) {
      case 'bold':
        classInfo['font-bold'] = true;
        break;
      case 'dim':
        classInfo['opacity-75'] = true;
        break;
      case 'italic':
        classInfo.italic = true;
        break;
      case 'underline':
        classInfo.underline = true;
        break;
      case 'strikethrough':
        classInfo['line-through'] = true;
        break;
      case 'hidden':
        classInfo.invisible = true;
        break;
      case 'blink':
        classInfo['motion-safe:animate-pulse'] = true;
        break;
      case 'reverse':
        classInfo.invert = true;
        break;
      default:
        console.warn(`Unknown ANSI decoration: ${String(decoration)}`);
    }
  }
  return [classInfo, styleInfo];
}
