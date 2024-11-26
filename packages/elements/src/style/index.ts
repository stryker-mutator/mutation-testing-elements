import './prism-plugins';

import { unsafeCSS } from 'lit';

import globalsCss from './globals.css?inline';
import prismjsCss from './prismjs.css?inline';
import tailwindCss from './tailwind.css?inline';

export const tailwind = unsafeCSS(tailwindCss);
export const prismjs = unsafeCSS(prismjsCss);
export const globals = unsafeCSS(globalsCss);
