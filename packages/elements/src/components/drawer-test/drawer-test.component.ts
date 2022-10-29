import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MutantModel, TestModel, TestStatus } from 'mutation-testing-metrics';
import { renderIfPresent, getEmojiForTestStatus, renderIf, plural, describeLocation } from '../../lib/html-helpers';
import { DrawerMode } from '../drawer/drawer.component';
import style from './drawer-test.scss';

const describeMutant = (mutant: MutantModel) => html`${mutant.id} <code>${mutant.getMutatedLines()}</code> (${describeLocation(mutant)})`;

@customElement('mte-drawer-test')
export class MutationTestReportDrawerTestComponent extends LitElement {
  @property()
  public test?: TestModel;

  @property({ reflect: true })
  public mode: DrawerMode = 'closed';

  /**
   * Disable shadow-DOM for this component to let parent styles apply (such as dark theme)
   */
  protected override createRenderRoot(): Element | ShadowRoot {
    return this;
  }

  public static styles = [unsafeCSS(style)];

  public render() {
    return html`<mte-drawer
      class="bg-slate-200 dark:bg-slate-800 rounded-t-2xl z-10"
      ?hasDetail="${this.test?.killedMutants || this.test?.coveredMutants}"
      .mode="${this.mode}"
    >
      ${renderIfPresent(
        this.test,
        (test) => html`
          <span class="text-lg" slot="header"
            >${test.id} ${getEmojiForTestStatus(test.status)} ${test.name} [${test.status}]
            ${test.location ? html`(${test.location.start.line}:${test.location.start.column})` : nothing}</span
          >
          <span slot="summary">${this.renderSummary()}</span>
          <span class="mx-6 block" slot="detail">${this.renderDetail()}</span>
        `
      )}
    </mte-drawer>`;
  }

  private renderSummary() {
    return html`<div class="d-flex ml-4 mr-6">
      ${this.test?.killedMutants?.[0]
        ? html`<h6 class="p-2"
            >🎯 Killed: ${describeMutant(this.test.killedMutants?.[0])}
            ${this.test.killedMutants.length > 1 ? html`(and ${this.test.killedMutants.length - 1} more)` : nothing}</h6
          >`
        : nothing}
      ${renderIfPresent(
        this.test?.coveredMutants,
        (coveredMutants) =>
          html`<h6 class="p-2">
            ☂️ Covered ${coveredMutants.length} mutant${plural(coveredMutants)}
            ${renderIf(this.test?.status === TestStatus.Covering, "(yet didn't kill any of them)")}
          </h6>`
      )}
    </div>`;
  }
  private renderDetail() {
    return html`<ul class="divide-y-2 divide-gray-400 border-2 border-gray-400 rounded-2xl mb-6 ml-2">
      ${this.test?.killedMutants?.map((mutant) => html`<li class="p-2" title="This test killed this mutant">🎯 ${describeMutant(mutant)}</li>`)}
      ${this.test?.coveredMutants
        ?.filter((mutant) => !this.test?.killedMutants?.includes(mutant))
        .map((mutant) => html`<li class="p-2" title="This test covered this mutant">☂️ ${describeMutant(mutant)}</li>`)}
    </ul>`;
  }
}
