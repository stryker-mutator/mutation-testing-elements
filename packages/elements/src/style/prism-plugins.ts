import 'prismjs/components/prism-core';

// Order is important here! Scala depends on java, which depends on clike
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-scala';
import 'prismjs/components/prism-gherkin';
import "prismjs/components/prism-rust";

// Markup and markup-templating are needed for php
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';

// Svelte
import 'prism-svelte';

// Don't strip pre-existing HTML to keep the popups and badges working
import 'prismjs/plugins/keep-markup/prism-keep-markup';
// Removed auto-loader plugin because of https://github.com/stryker-mutator/mutation-testing-elements/issues/393
