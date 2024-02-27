import { unsafeCSS } from 'lit';
import tailwindCss from './tailwind.css?inline';
import prismjsCss from './prismjs.css?inline';
import globalsCss from './globals.css?inline';
import './prism-plugins';

export const tailwind = unsafeCSS(tailwindCss);
export const prismjs = unsafeCSS(prismjsCss);
export const globals = unsafeCSS(globalsCss);
