import { unsafeCSS } from 'lit';
import bootstrapCss from './bootstrap.scss';
import prismjsCss from './prismjs.scss';
import globalsCss from './globals.scss';
import './prism-plugins';

export const bootstrap = unsafeCSS(bootstrapCss);
export const prismjs = unsafeCSS(prismjsCss);
export const globals = unsafeCSS(globalsCss);
