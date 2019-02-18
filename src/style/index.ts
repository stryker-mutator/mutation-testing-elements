import { css, CSSResult, unsafeCSS } from 'lit-element';
const bootstrapCss = require('./bootstrap.scss');
const highlightjsCss = require('./highlightjs.scss');

const b = bootstrapCss.toString();
console.log(b);
export const bootstrap: CSSResult = css`${unsafeCSS(b)}`;
export const highlightJS: CSSResult = css`${unsafeCSS(highlightjsCss.toString())}`;
