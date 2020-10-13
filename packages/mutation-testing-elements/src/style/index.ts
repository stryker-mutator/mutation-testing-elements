import { unsafeCSS } from 'lit-element';
const bootstrapCss = require('./bootstrap.scss');
const prismjsCss = require('./prismjs.scss');

export const bootstrap = unsafeCSS(String(bootstrapCss));
export const prismjs = unsafeCSS(String(prismjsCss));
