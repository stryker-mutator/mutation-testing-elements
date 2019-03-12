import { unsafeCSS } from 'lit-element';
const bootstrapCss = require('./bootstrap.scss');
const highlightjsCss = require('./highlightjs.scss');

export const bootstrap = unsafeCSS(bootstrapCss.toString());
export const highlightJS = unsafeCSS(highlightjsCss.toString());
