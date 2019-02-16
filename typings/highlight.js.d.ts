declare module 'highlight.js/lib/highlight' {
  function registerLanguage(name: string, language: Language): void;
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

declare class Language { }