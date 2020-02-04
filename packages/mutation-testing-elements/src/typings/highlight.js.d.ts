declare module 'highlight.js/lib/highlight' {
  interface HighlightResult {
    relevance: number;
    value: string;
  }
  function registerLanguage(name: string, language: Language): void;
  function highlight(language: string, code: string): HighlightResult;
  function highlightBlock(code: HTMLElement): void;
}

declare module 'highlight.js/lib/languages/javascript' {
  export = Language;
}
declare module 'highlight.js/lib/languages/typescript' {
  export = Language;
}
declare module 'highlight.js/lib/languages/scala' {
  export = Language;
}
declare module 'highlight.js/lib/languages/java' {
  export = Language;
}
declare module 'highlight.js/lib/languages/cs' {
  export = Language;
}

declare class Language {}
