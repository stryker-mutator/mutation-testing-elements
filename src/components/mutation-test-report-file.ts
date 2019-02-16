import { LitElement, html, property, customElement } from 'lit-element';
import { FileResult } from '../api';
import hljs from 'highlight.js/lib/highlight';
import javascript from 'highlight.js/lib/languages/javascript';
import scala from 'highlight.js/lib/languages/scala';
import java from 'highlight.js/lib/languages/java';
import cs from 'highlight.js/lib/languages/cs';
import typescript from 'highlight.js/lib/languages/typescript';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('cs', cs);
hljs.registerLanguage('java', java);
hljs.registerLanguage('scala', scala);

@customElement('mutation-test-report-file')
export class MutationTestReportFileComponent extends LitElement {

  @property()
  private readonly model!: FileResult;

  public render() {
    return html`
          <link rel="stylesheet" href="/dist/css/bootstrap.min.css">
          <link rel="stylesheet" href="/node_modules/highlight.js/styles/default.css">
          <pre>${html`${this.renderCode()}`}</pre>
        `;
  }

  public renderCode() {
    const code = document.createElement('code');
    code.innerHTML = this.model.source;
    code.classList.add(`lang-${this.model.language}`);
    hljs.highlightBlock(code);
    return code;
  }
}
