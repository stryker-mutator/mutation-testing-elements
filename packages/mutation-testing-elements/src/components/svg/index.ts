import { svg, SVGTemplateResult } from 'lit-html';

export class SvgService {

  // Octicons - Github
  private readonly file: SVGTemplateResult = svg`<svg aria-label="file" class="octicon octicon-file" viewBox="0 0 12 16" version="1.1" width="12" height="16" role="img"><path fill-rule="evenodd" d="M6 5H2V4h4v1zM2 8h7V7H2v1zm0 2h7V9H2v1zm0 2h7v-1H2v1zm10-7.5V14c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h7.5L12 4.5zM11 5L8 2H1v12h10V5z"></path></svg>`;
  private readonly directory: SVGTemplateResult = svg`<svg aria-label="directory" class="octicon octicon-file-directory" viewBox="0 0 14 16" version="1.1" width="14" height="16" role="img"><path fill-rule="evenodd" d="M13 4H7V3c0-.66-.31-1-1-1H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zM6 4H1V3h5v1z"></path></svg>`;

  // VS code icons - Github (https://github.com/jesseweed/seti-ui/tree/master/icons)
  private readonly csharp: SVGTemplateResult = svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g fill="#498ba7"><path d="M7.1 15.9c0-1.3.2-2.4.6-3.4.4-1 .9-1.8 1.6-2.5.7-.7 1.5-1.2 2.4-1.6s1.9-.5 2.9-.5 1.9.2 2.7.6c.8.4 1.5.9 2 1.4l-2.2 2.5c-.4-.3-.7-.6-1.1-.7-.4-.1-.8-.3-1.4-.3-.5 0-.9.1-1.3.3-.4.2-.8.5-1.1.9s-.5.8-.7 1.4c-.2.6-.3 1.2-.3 1.9 0 1.5.3 2.6 1 3.3.7.8 1.5 1.2 2.6 1.2.5 0 1-.1 1.4-.3.4-.2.8-.5 1.1-.9l2.2 2.5c-.7.8-1.4 1.3-2.2 1.7-.8.4-1.7.6-2.7.6s-2-.2-2.9-.5-1.7-.8-2.4-1.5-1.1-1.7-1.5-2.7c-.5-.9-.7-2.1-.7-3.4z"/><path d="M21.8 17.1h-1l-.4 2.4h-1.2l.4-2.4h-1.2V16h1.5l.2-1.6h-1.3v-1.1h1.5l.4-2.4h1.2l-.4 2.4h1l.4-2.4h1.2l-.4 2.4H25v1.1h-1.6l-.2 1.6h1.3v1.1h-1.6l-.4 2.4h-1.2c0 .1.5-2.4.5-2.4zm-.8-1h1l.2-1.6h-1l-.2 1.6z"/></g></svg>`;
  private readonly html: SVGTemplateResult = svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#cc6d2e" d="M8 15l6-5.6V12l-4.5 4 4.5 4v2.6L8 17v-2zm16 2.1l-6 5.6V20l4.6-4-4.6-4V9.3l6 5.6v2.2z"/></svg>`;
  private readonly java: SVGTemplateResult = svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 20 20"><path class="cls-1" d="M6 0a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm2.14 6.8a2.16 2.16 0 0 1-2.29 2.41 2.5 2.5 0 0 1-2-.87l.73-.92a1.52 1.52 0 0 0 1.23.59c.66 0 1.06-.42 1.06-1.32V2.8h1.26z" fill="#b8383d"/></svg>`;
  private readonly javascript = svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#b7b73b" d="M11.4 10h2.7v7.6c0 3.4-1.6 4.6-4.3 4.6-.6 0-1.5-.1-2-.3l.3-2.2c.4.2.9.3 1.4.3 1.1 0 1.9-.5 1.9-2.4V10zm5.1 9.2c.7.4 1.9.8 3 .8 1.3 0 1.9-.5 1.9-1.3s-.6-1.2-2-1.7c-2-.7-3.3-1.8-3.3-3.6 0-2.1 1.7-3.6 4.6-3.6 1.4 0 2.4.3 3.1.6l-.6 2.2c-.5-.2-1.3-.6-2.5-.6s-1.8.5-1.8 1.2c0 .8.7 1.1 2.2 1.7 2.1.8 3.1 1.9 3.1 3.6 0 2-1.6 3.7-4.9 3.7-1.4 0-2.7-.4-3.4-.7l.6-2.3z"/></svg>`;
  private readonly scala: SVGTemplateResult = svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M21.6 7v4.2c-.1.1-.1.2-.2.2-.3.3-.7.5-1.1.6-.9.3-1.9.5-2.8.7-1.6.3-3.1.5-4.7.7-.8.1-1.6.2-2.4.4V9.6c.1-.1.2-.1.4-.1 1.2-.2 2.5-.4 3.8-.5 1.9-.3 3.8-.5 5.6-1.1.5-.2 1.1-.4 1.4-.9zm0 5.6v4.2l-.2.2c-.5.4-1.1.6-1.6.8-.8.2-1.6.4-2.4.5-1 .2-1.9.3-2.9.5-1.4.2-2.7.3-4.1.6v-4.2c.1-.1.2-.1.3-.1 1.7-.2 3.4-.5 5.1-.7 1.4-.2 2.9-.5 4.3-.9.6-.2 1.1-.4 1.5-.9zM10.5 25h-.1v-4.2c.1-.1.2-.1.3-.1 1.2-.2 2.3-.3 3.5-.5 2-.3 3.9-.5 5.8-1.1.6-.2 1.2-.4 1.6-.9v4.2c-.1.2-.3.3-.5.5-.6.3-1.2.5-1.9.7-1.2.3-2.5.5-3.7.7-1.3.2-2.6.4-3.9.5-.4 0-.7.1-1.1.2z" fill="#b8383d"/></svg>`;
  private readonly typescript: SVGTemplateResult = svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M15.6 11.8h-3.4V22H9.7V11.8H6.3V10h9.2v1.8zm7.7 7.1c0-.5-.2-.8-.5-1.1-.3-.3-.9-.5-1.7-.8-1.4-.4-2.5-.9-3.3-1.5-.7-.6-1.1-1.3-1.1-2.3 0-1 .4-1.8 1.3-2.4.8-.6 1.9-.9 3.2-.9 1.3 0 2.4.4 3.2 1.1.8.7 1.2 1.6 1.2 2.6h-2.3c0-.6-.2-1-.6-1.4-.4-.3-.9-.5-1.6-.5-.6 0-1.1.1-1.5.4-.4.3-.5.7-.5 1.1 0 .4.2.7.6 1 .4.3 1 .5 2 .8 1.3.4 2.3.9 3 1.5.7.6 1 1.4 1 2.4s-.4 1.9-1.2 2.4c-.8.6-1.9.9-3.2.9-1.3 0-2.5-.3-3.4-1s-1.5-1.6-1.4-2.9h2.4c0 .7.2 1.2.7 1.6.4.3 1.1.5 1.8.5s1.2-.1 1.5-.4c.2-.3.4-.7.4-1.1z" fill="#498ba7"/></svg>`;

  private readonly svgMapping: Map<string, SVGTemplateResult> = new Map();

  constructor() {
    this.svgMapping.set('cs', this.csharp);
    this.svgMapping.set('html', this.html);
    this.svgMapping.set('java', this.java);
    this.svgMapping.set('js', this.javascript);
    this.svgMapping.set('scala', this.scala);
    this.svgMapping.set('ts', this.typescript);
  }

  public getIconForFile(fileName: string): SVGTemplateResult {
    const fileExtension = this.getFileExtension(fileName);
    const svg = this.svgMapping.get(fileExtension);

    if (svg !== undefined) {
      return svg;
    } else {
      return this.file;
    }
  }

  public getIconForFolder(): SVGTemplateResult {
    return this.directory;
  }

  private getFileExtension(fileName: string): string {
    const tokens = fileName.split('.');
    return tokens[tokens.length - 1];
  }
}
