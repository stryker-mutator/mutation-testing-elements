import { css, CSSResult, unsafeCSS } from 'lit-element';
const bootstrapCss = require('./bootstrap.scss');
const highlightjsCss = require('./highlightjs.scss');

export const bootstrap: CSSResult = css`${unsafeCSS(bootstrapCss.toString())}`;
export const highlightJS: CSSResult = css`${unsafeCSS(highlightjsCss.toString())}`;
