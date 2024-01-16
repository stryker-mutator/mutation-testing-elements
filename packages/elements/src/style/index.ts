import { unsafeCSS } from 'lit';
import tailwindCss from './tailwind.css?inline';
import prismjsCss from './prismjs.scss?inline';
import globalsCss from './globals.scss?inline';
import './prism-plugins';

export const tailwind = unsafeCSS(tailwindCss);
export const prismjs = unsafeCSS(prismjsCss);
export const globals = unsafeCSS(globalsCss);
