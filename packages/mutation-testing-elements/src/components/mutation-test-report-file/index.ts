import { LitElement, html, property, customElement, unsafeCSS } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import hljs from 'highlight.js/lib/highlight';
import javascript from 'highlight.js/lib/languages/javascript';
import scala from 'highlight.js/lib/languages/scala';
import java from 'highlight.js/lib/languages/java';
import cs from 'highlight.js/lib/languages/cs';
import typescript from 'highlight.js/lib/languages/typescript';
import { MutationTestReportMutantComponent, SHOW_MORE_EVENT } from '../mutation-test-report-mutant';
import { MutantFilter } from '../mutation-test-report-file-legend';
import { bootstrap, highlightJS } from '../../style';
import { renderCode } from '../../lib/codeHelpers';
import { FileResult, MutantResult } from 'mutation-testing-report-schema';
import { getEmojiForStatus } from '../../lib/htmlHelpers';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('cs', cs);
hljs.registerLanguage('scala', scala);
hljs.registerLanguage('java', java);

@customElement('mutation-test-report-file')
export class MutationTestReportFileComponent extends LitElement {
  @property()
  public model!: FileResult;

  public static styles = [highlightJS, bootstrap, unsafeCSS(require('./index.scss'))];

  private readonly expandAll = () => {
    this.forEachMutantComponent(mutantComponent => (mutantComponent.expand = true));
  };
  private readonly collapseAll = () => {
    this.forEachMutantComponent(mutantComponent => (mutantComponent.expand = false));
  };

  private forEachMutantComponent(action: (mutant: MutationTestReportMutantComponent) => void, host = this.root) {
    for (const mutantComponent of host.querySelectorAll('mutation-test-report-mutant')) {
      if (mutantComponent instanceof MutationTestReportMutantComponent) {
        action(mutantComponent);
      }
    }
  }

  private readonly filtersChanged = (event: CustomEvent<MutantFilter[]>) => {
    const enabledMutantStates = event.detail.filter(mutantFilter => mutantFilter.enabled).map(mutantFilter => mutantFilter.status);
    this.forEachMutantComponent(mutantComponent => {
      mutantComponent.show = enabledMutantStates.some(state => mutantComponent.mutant !== undefined && mutantComponent.mutant.status === state);
    });
  };

  public connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', () => {
      this.forEachMutantComponent(mutant => (mutant.showPopup = false));
    });
    this.addEventListener('mutant-selected', (event: Event) => {
      const selectedMutant = (event as CustomEvent<MutationTestReportMutantComponent>).detail;
      this.forEachMutantComponent(mutant => mutant !== selectedMutant && (mutant.showPopup = false));
    });
    this.addEventListener(SHOW_MORE_EVENT, (event: Event) => {
      const selectedMutant = (event as CustomEvent<MutantResult>).detail;
      this.mutantInDialog = selectedMutant;
      event.stopPropagation();
    });
    this.addEventListener('close-dialog', () => {
      this.mutantInDialog = undefined;
    });
  }

  @property({ attribute: false })
  private mutantInDialog: MutantResult | undefined;

  public render() {
    if (this.model) {
      return html`
        <div class="row">
          <div class="col-md-12">
            ${this.renderModalDialog()}
            <mutation-test-report-file-legend
              @filters-changed="${this.filtersChanged}"
              @expand-all="${this.expandAll}"
              @collapse-all="${this.collapseAll}"
              .mutants="${this.model.mutants}"
            ></mutation-test-report-file-legend>
            <pre><code class="lang-${this.model.language} hljs">${unsafeHTML(renderCode(this.model))}</code></pre>
          </div>
        </div>
      `;
    }
    return undefined;
  }

  private renderModalDialog() {
    if (this.mutantInDialog) {
      return html`
        <div .hidden="${!this.mutantInDialog}" class="modal-backdrop show"></div>
        <mutation-test-report-modal-dialog
          ?show="${this.mutantInDialog}"
          header="${this.mutantInDialog.id}: ${this.mutantInDialog.mutatorName} - ${getEmojiForStatus(this.mutantInDialog.status)} ${this
            .mutantInDialog.status}"
        >
          <p>${this.mutantInDialog.description}</p>
        </mutation-test-report-modal-dialog>
      `;
    } else {
      return undefined;
    }
  }

  public firstUpdated() {
    const code = this.root.querySelector('code');
    if (code) {
      hljs.highlightBlock(code);
      this.forEachMutantComponent(mutantComponent => {
        mutantComponent.mutant = this.model.mutants.find(mutant => mutant.id.toString() === mutantComponent.getAttribute('mutant-id'));
      }, code);
    }
  }

  private get root(): ParentNode {
    return this.shadowRoot || this;
  }
}
