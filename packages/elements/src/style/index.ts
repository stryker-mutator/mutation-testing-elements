import { unsafeCSS } from 'lit';
import tailwindCss from './tailwind.css';
import prismjsCss from './prismjs.scss';
import globalsCss from './globals.scss';
import './prism-plugins';

export const tailwind = unsafeCSS(tailwindCss);
export const prismjs = unsafeCSS(prismjsCss);
export const globals = unsafeCSS(globalsCss);
