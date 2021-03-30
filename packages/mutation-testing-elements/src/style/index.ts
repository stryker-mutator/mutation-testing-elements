import { unsafeCSS } from 'lit-element';
import bootstrapCss from './bootstrap.scss';
import prismjsCss from './prismjs.scss';
import './prism-plugins';

export const bootstrap = unsafeCSS(bootstrapCss);
export const prismjs = unsafeCSS(prismjsCss);
