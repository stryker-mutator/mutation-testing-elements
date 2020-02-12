import { unsafeCSS } from 'lit-element';
const bootstrapCss = require('./bootstrap.scss');
const prismjsCss = require('./prismjs.scss');

export const bootstrap = unsafeCSS(bootstrapCss.toString());
export const prismjs = unsafeCSS(prismjsCss.toString());
