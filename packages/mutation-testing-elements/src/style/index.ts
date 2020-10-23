import { unsafeCSS } from 'lit-element';
import bootstrapCss from './bootstrap.scss';
import prismjsCssLight from './prismjs.light.scss';
import prismjsCssDark from './prismjs.dark.scss';

export const bootstrap = unsafeCSS(bootstrapCss);
export const prismjslight = unsafeCSS(prismjsCssLight);
export const prismjsdark = unsafeCSS(prismjsCssDark);
