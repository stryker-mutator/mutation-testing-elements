import './prism-plugins';

import { unsafeCSS } from 'lit';

import prismjsCss from './prismjs.css?inline';
import tailwindCss from './tailwind.css?inline';

export const tailwind = unsafeCSS(tailwindCss);
export const prismjs = unsafeCSS(prismjsCss);

// https://github.com/tailwindlabs/tailwindcss/issues/15005
// Set all @property values from tailwind on the document
// And only do this once (check if the there is already a stylesheet with the same content)
if (
  tailwind.styleSheet &&
  document?.adoptedStyleSheets &&
  !document.adoptedStyleSheets.some((sheet) => sheet.cssRules[0]?.cssText === tailwind.styleSheet!.cssRules[0].cssText)
) {
  const propertiesSheet = new CSSStyleSheet();
  let code = tailwind.cssText;

  code = code
    // Change custom properties to inherit
    .replaceAll('inherits: false', 'inherits: true')
    // Remove everything before the property declarations
    .substring(code.indexOf('@property'));

  propertiesSheet.replaceSync(code);

  document.adoptedStyleSheets.push(propertiesSheet);
}
