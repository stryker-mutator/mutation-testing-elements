import { LitElement, html, property, customElement, PropertyValues, unsafeCSS } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import hljs from 'highlight.js/lib/highlight';
import javascript from 'highlight.js/lib/languages/javascript';
import scala from 'highlight.js/lib/languages/scala';
import cs from 'highlight.js/lib/languages/cs';
import typescript from 'highlight.js/lib/languages/typescript';
import { MutationTestReportMutantComponent } from '../mutation-test-report-mutant';
import { MutantFilter } from '../mutation-test-report-file-legend';
import { bootstrap, highlightJS } from '../../style';
import { FileResultModel } from '../../model';
import { renderCode } from '../../lib/helpers';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('cs', cs);
hljs.registerLanguage('scala', scala);

@customElement('mutation-test-report-file')
export class MutationTestReportFileComponent extends LitElement {

  @property()
  public model!: FileResultModel;

  public static styles = [
    highlightJS,
    bootstrap,
    unsafeCSS(require('./mutation-test-report-file.scss'))
  ];

  private readonly expandAll = () => {
    this.forEachMutantComponent(mutantComponent => mutantComponent.expand = true);
  }
  private readonly collapseAll = () => {
    this.forEachMutantComponent(mutantComponent => mutantComponent.expand = false);
  }

  private forEachMutantComponent(action: (mutant: MutationTestReportMutantComponent) => void, host = this.root) {
    for (const mutantComponent of host.querySelectorAll('mutation-test-report-mutant')) {
      if (mutantComponent instanceof MutationTestReportMutantComponent) {
        action(mutantComponent);
      }
    }
  }

  private readonly filtersChanged = (event: CustomEvent<MutantFilter[]>) => {
    const enabledMutantStates = event.detail
      .filter(mutantFilter => mutantFilter.enabled)
      .map(mutantFilter => mutantFilter.status);
    this.forEachMutantComponent(mutantComponent => {
      mutantComponent.show = enabledMutantStates.some(state => mutantComponent.mutant !== undefined && mutantComponent.mutant.status === state);
    });
  }

  public connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', () => {
      this.forEachMutantComponent(mutant => mutant.showPopup = false);
    });
    this.addEventListener('mutant-selected', (event: Event) => {
      const selectedMutant = (event as CustomEvent<MutationTestReportMutantComponent>).detail;
      this.forEachMutantComponent(mutant => mutant !== selectedMutant && (mutant.showPopup = false));
    });
  }

  public render() {
    if (this.model) {
      return html`
        <div class="row">
          <div class="col-md-12">
            <mutation-test-report-file-legend @filters-changed="${this.filtersChanged}" @expand-all="${this.expandAll}"
              @collapse-all="${this.collapseAll}" .mutants="${this.model.mutants}"></mutation-test-report-file-legend>
            <pre><code class="lang-${this.model.language} hljs">${unsafeHTML(renderCode(this.model))}</code></pre>
          </div>
        </div>
        `;
    }
    return undefined;
  }

  public firstUpdated(_changedProperties: PropertyValues) {
    const code = this.root.querySelector('code');
    if (code) {
      hljs.highlightBlock(code);
      this.forEachMutantComponent(mutantComponent => {
        mutantComponent.mutant = this.model.mutants
          .find(mutant => mutant.id.toString() === mutantComponent.getAttribute('mutant-id'));
      }, code);
    }
  }

  private get root(): ParentNode {
    return this.shadowRoot || this;
  }
}
