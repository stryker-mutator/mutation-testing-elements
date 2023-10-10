import { LitElement, svg, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { determineLanguage, ProgrammingLanguage } from '../../lib/code-helpers';
import style from './file-icon.scss';
import { classMap } from 'lit/directives/class-map.js';
@customElement('mte-file-icon')
export class MutationTestReportFileIconComponent extends LitElement {
  @property({ attribute: 'file-name' })
  public declare fileName: string;

  @property({ attribute: 'file', type: Boolean })
  public declare isFile: boolean;

  public static styles = [unsafeCSS(style)];

  private get language(): undefined | ProgrammingLanguage {
    return determineLanguage(this.fileName);
  }

  private get isTestFile() {
    const baseName = this.fileName.substr(0, this.fileName.lastIndexOf('.')).toLowerCase();
    return baseName.endsWith('spec') || baseName.endsWith('test');
  }

  private get cssClass() {
    return classMap({ [this.language?.toString() ?? 'unknown']: this.isFile, test: this.isTestFile });
  }

  public render() {
    // Octicons - Github
    if (!this.isFile) {
      return svg`<svg aria-label="directory" class="octicon octicon-file-directory" viewBox="0 0 14 16" version="1.1" width="14" height="16" role="img"><path fill-rule="evenodd" d="M 13,2 H 7 V 1 C 7,0.34 6.69,0 6,0 H 1 C 0.45,0 0,0.45 0,1 v 10 c 0,0.55 0.45,1 1,1 h 12 c 0.55,0 1,-0.45 1,-1 V 3 C 14,2.45 13.55,2 13,2 Z M 6,2 H 1 V 1 h 5 z" id="path2" /></svg>`;
    }
    if (!this.language) {
      return svg`<svg aria-label="file" class="octicon octicon-file" viewBox="0 0 12 16" version="1.1" width="12" height="16" role="img"><path fill-rule="evenodd" d="M6 5H2V4h4v1zM2 8h7V7H2v1zm0 2h7V9H2v1zm0 2h7v-1H2v1zm10-7.5V14c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h7.5L12 4.5zM11 5L8 2H1v12h10V5z"></path></svg>`;
    }

    // Exhaustiveness checking is active here. Adding a new language in the enum will automatically result in a compile error here. That's why its missing a `default` case
    switch (this.language) {
      case ProgrammingLanguage.csharp:
        return svg`<svg class="${this.cssClass}" aria-label="cs" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g><path d="M7.1 15.9c0-1.3.2-2.4.6-3.4.4-1 .9-1.8 1.6-2.5.7-.7 1.5-1.2 2.4-1.6s1.9-.5 2.9-.5 1.9.2 2.7.6c.8.4 1.5.9 2 1.4l-2.2 2.5c-.4-.3-.7-.6-1.1-.7-.4-.1-.8-.3-1.4-.3-.5 0-.9.1-1.3.3-.4.2-.8.5-1.1.9s-.5.8-.7 1.4c-.2.6-.3 1.2-.3 1.9 0 1.5.3 2.6 1 3.3.7.8 1.5 1.2 2.6 1.2.5 0 1-.1 1.4-.3.4-.2.8-.5 1.1-.9l2.2 2.5c-.7.8-1.4 1.3-2.2 1.7-.8.4-1.7.6-2.7.6s-2-.2-2.9-.5-1.7-.8-2.4-1.5-1.1-1.7-1.5-2.7c-.5-.9-.7-2.1-.7-3.4z"/><path d="M21.8 17.1h-1l-.4 2.4h-1.2l.4-2.4h-1.2V16h1.5l.2-1.6h-1.3v-1.1h1.5l.4-2.4h1.2l-.4 2.4h1l.4-2.4h1.2l-.4 2.4H25v1.1h-1.6l-.2 1.6h1.3v1.1h-1.6l-.4 2.4h-1.2c0 .1.5-2.4.5-2.4zm-.8-1h1l.2-1.6h-1l-.2 1.6z"/></g></svg>`;
      case ProgrammingLanguage.html:
        return svg`<svg class="${this.cssClass}" aria-label="html" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M8 15l6-5.6V12l-4.5 4 4.5 4v2.6L8 17v-2zm16 2.1l-6 5.6V20l4.6-4-4.6-4V9.3l6 5.6v2.2z"/></svg>`;
      case ProgrammingLanguage.java:
        return svg`<svg class="${this.cssClass}" aria-label="java" xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 20 20"><path class="cls-1" d="M6 0a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm2.14 6.8a2.16 2.16 0 0 1-2.29 2.41 2.5 2.5 0 0 1-2-.87l.73-.92a1.52 1.52 0 0 0 1.23.59c.66 0 1.06-.42 1.06-1.32V2.8h1.26z"/></svg>`;
      case ProgrammingLanguage.javascript:
        return svg`<svg class="${this.cssClass}" aria-label="js" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path  d="M11.4 10h2.7v7.6c0 3.4-1.6 4.6-4.3 4.6-.6 0-1.5-.1-2-.3l.3-2.2c.4.2.9.3 1.4.3 1.1 0 1.9-.5 1.9-2.4V10zm5.1 9.2c.7.4 1.9.8 3 .8 1.3 0 1.9-.5 1.9-1.3s-.6-1.2-2-1.7c-2-.7-3.3-1.8-3.3-3.6 0-2.1 1.7-3.6 4.6-3.6 1.4 0 2.4.3 3.1.6l-.6 2.2c-.5-.2-1.3-.6-2.5-.6s-1.8.5-1.8 1.2c0 .8.7 1.1 2.2 1.7 2.1.8 3.1 1.9 3.1 3.6 0 2-1.6 3.7-4.9 3.7-1.4 0-2.7-.4-3.4-.7l.6-2.3z"/></svg>`;
      case ProgrammingLanguage.typescript:
        return svg`<svg class="${this.cssClass}" aria-label="ts" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M15.6 11.8h-3.4V22H9.7V11.8H6.3V10h9.2v1.8zm7.7 7.1c0-.5-.2-.8-.5-1.1-.3-.3-.9-.5-1.7-.8-1.4-.4-2.5-.9-3.3-1.5-.7-.6-1.1-1.3-1.1-2.3 0-1 .4-1.8 1.3-2.4.8-.6 1.9-.9 3.2-.9 1.3 0 2.4.4 3.2 1.1.8.7 1.2 1.6 1.2 2.6h-2.3c0-.6-.2-1-.6-1.4-.4-.3-.9-.5-1.6-.5-.6 0-1.1.1-1.5.4-.4.3-.5.7-.5 1.1 0 .4.2.7.6 1 .4.3 1 .5 2 .8 1.3.4 2.3.9 3 1.5.7.6 1 1.4 1 2.4s-.4 1.9-1.2 2.4c-.8.6-1.9.9-3.2.9-1.3 0-2.5-.3-3.4-1s-1.5-1.6-1.4-2.9h2.4c0 .7.2 1.2.7 1.6.4.3 1.1.5 1.8.5s1.2-.1 1.5-.4c.2-.3.4-.7.4-1.1z"/></svg>`;
      case ProgrammingLanguage.scala:
        return svg`<svg class="${this.cssClass}" aria-label="scala" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M21.6 7v4.2c-.1.1-.1.2-.2.2-.3.3-.7.5-1.1.6-.9.3-1.9.5-2.8.7-1.6.3-3.1.5-4.7.7-.8.1-1.6.2-2.4.4V9.6c.1-.1.2-.1.4-.1 1.2-.2 2.5-.4 3.8-.5 1.9-.3 3.8-.5 5.6-1.1.5-.2 1.1-.4 1.4-.9zm0 5.6v4.2l-.2.2c-.5.4-1.1.6-1.6.8-.8.2-1.6.4-2.4.5-1 .2-1.9.3-2.9.5-1.4.2-2.7.3-4.1.6v-4.2c.1-.1.2-.1.3-.1 1.7-.2 3.4-.5 5.1-.7 1.4-.2 2.9-.5 4.3-.9.6-.2 1.1-.4 1.5-.9zM10.5 25h-.1v-4.2c.1-.1.2-.1.3-.1 1.2-.2 2.3-.3 3.5-.5 2-.3 3.9-.5 5.8-1.1.6-.2 1.2-.4 1.6-.9v4.2c-.1.2-.3.3-.5.5-.6.3-1.2.5-1.9.7-1.2.3-2.5.5-3.7.7-1.3.2-2.6.4-3.9.5-.4 0-.7.1-1.1.2z"/></svg>`;
      case ProgrammingLanguage.php:
        return svg`<svg class="${this.cssClass}" aria-label="php" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M12.7 19.7c-.1-.6-.4-1.1-1-1.3-.2-.1-.5-.3-.7-.4-.3-.1-.6-.2-.8-.3-.2-.1-.4 0-.6.2-.1.2 0 .4.1.5.1.2.2.3.4.5.2.3.4.5.7.8.2.3.4.5.3.9-.1.7-.4 1.4-.9 1.9-.1.1-.2.1-.2.1-.3 0-.7-.2-.9-.4-.3-.3-.2-.6.1-.8.1 0 .2-.1.2-.2.2-.2.3-.4.2-.7-.1-.1-.1-.2-.2-.3-.4-.4-.9-.8-1.4-1.2-1.3-1-1.9-2.2-2-3.6-.1-1.6.3-3.1 1.1-4.5.3-.5.7-1 1.3-1.3.4-.2.8-.3 1.2-.4 1.1-.3 2.3-.5 3.5-.3 1 .2 1.8.7 2.1 1.7.2.7.3 1.3.2 2-.1 1.4-1.2 2.6-2.5 3-.6.2-.9.1-1.2-.4-.2-.3-.5-.7-.7-1.1V14c0-.1-.1-.1-.1-.2.1.6.2 1.2.5 1.7.2.3.4.5.8.5 1.3.1 2.3-.3 3.1-1.3.8-1.1 1-2.4.8-3.8 0-.3-.1-.5-.2-.8 0-.2 0-.3.2-.4.1 0 .2 0 .2-.1 1-.2 2.1-.3 3.1-.2 1.2.1 2.3.4 3.3 1.1 1.6 1 2.6 2.5 3.1 4.3.1.3.1.5.1.8 0 .2-.1.2-.3.1-.2-.1-.3-.3-.4-.4-.1-.1-.2-.3-.3-.4-.1-.1-.2-.1-.2 0s-.1.2-.1.3c-.3 1-.7 1.9-1.4 2.6-.1.1-.2.3-.2.4 0 .4-.1.8 0 1.2.1.8.2 1.7.3 2.5.1.5-.1.7-.5.9-.3.1-.6.2-1 .2h-1.6c0-.6 0-1.2-.5-1.5.1-.4.2-.8.3-1.3.1-.4 0-.7-.2-1-.2-.3-.5-.3-.8-.2-.8.5-1.6.5-2.5.2-.4-.1-.7-.1-.9.3-.2.4-.3.8-.3 1.2 0 .5.1 1.1.2 1.6 0 .3 0 .4-.3.5-.7.2-1.4.2-2 .1h-.1c0-.6 0-1.2-.7-1.5.4-.4.4-1.1.3-1.7zm-4.1-2.3c.1-.1.2-.2.2-.4.1-.3-.2-.8-.5-.9-.2-.1-.3 0-.4.1-.3.3-.5.6-.8.9 0 .1-.1.1-.1.2-.1.2 0 .4.2.4.1 0 .3 0 .4.1.4 0 .7-.1 1-.4zm0-3.3c0-.2-.2-.4-.4-.4s-.5.2-.4.5c0 .2.2.4.5.4.1-.1.3-.3.3-.5z"/></svg>`;
      case ProgrammingLanguage.vue:
        return svg`<svg class="${this.cssClass}" aria-label="vue" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1000"><path d="M600 495.9l159.1-275.4h-84.4L600 349.7l-74.6-129.2h-84.5z"/><path d="M793.7 220.5L600 555.9 406.3 220.5H277l323 559 323-559z"/></svg>`;
      case ProgrammingLanguage.gherkin:
        return svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M16.129,2a12.348,12.348,0,0,0-2.35,24.465V30c7.371-1.114,13.9-6.982,14.384-14.684a12.8,12.8,0,0,0-5.9-11.667c-.223-.132-.449-.262-.682-.377s-.481-.231-.729-.33c-.079-.033-.156-.063-.235-.094-.216-.08-.435-.17-.658-.236A12.188,12.188,0,0,0,16.129,2Z" style="fill:var(--mut-file-gherkin-color)"/><path d="M18.68,6.563a1.345,1.345,0,0,0-1.178.472,5.493,5.493,0,0,0-.518.9,2.9,2.9,0,0,0,.377,3.023A3.317,3.317,0,0,0,19.763,9,2.388,2.388,0,0,0,20,8,1.411,1.411,0,0,0,18.68,6.563Zm-5.488.071A1.441,1.441,0,0,0,11.85,8,2.388,2.388,0,0,0,12.085,9a3.427,3.427,0,0,0,2.473,1.96,3.141,3.141,0,0,0-.212-3.85,1.322,1.322,0,0,0-1.154-.472Zm-3.7,3.637a1.3,1.3,0,0,0-.73,2.338,5.663,5.663,0,0,0,.895.543,3.386,3.386,0,0,0,3.179-.307,3.492,3.492,0,0,0-2.049-2.338,2.69,2.69,0,0,0-1.06-.236,1.369,1.369,0,0,0-.236,0Zm11.611,4.582a3.44,3.44,0,0,0-1.955.567A3.492,3.492,0,0,0,21.2,17.758a2.69,2.69,0,0,0,1.06.236,1.329,1.329,0,0,0,.966-2.362,5.47,5.47,0,0,0-.895-.52,3.247,3.247,0,0,0-1.225-.26Zm-10.292.071a3.247,3.247,0,0,0-1.225.26,2.575,2.575,0,0,0-.895.543A1.34,1.34,0,0,0,9.73,18.065a2.426,2.426,0,0,0,1.06-.236,3.185,3.185,0,0,0,1.955-2.338,3.366,3.366,0,0,0-1.931-.567Zm3.815,2.314a3.317,3.317,0,0,0-2.4,1.96,2.286,2.286,0,0,0-.236.968,1.4,1.4,0,0,0,2.426.992,5.492,5.492,0,0,0,.518-.9,3.109,3.109,0,0,0-.306-3.023Zm2.8.071a3.141,3.141,0,0,0,.212,3.85,1.47,1.47,0,0,0,2.5-.9,2.388,2.388,0,0,0-.236-.992,3.427,3.427,0,0,0-2.473-1.96Z" style="fill:#fff"/></svg>`;
    }
  }
}
