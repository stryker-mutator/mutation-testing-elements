import { customElement, html, LitElement, property } from 'lit-element';
import { MutantModel, TestModel } from 'mutation-testing-metrics';
import { TestStatus } from 'mutation-testing-metrics/src/model/test-model';
import { renderIfPresent, getEmojiForTestStatus, getEmojiForStatus, renderIf, plural } from '../../lib/htmlHelpers';
import { bootstrap } from '../../style';
import { DrawerMode } from '../mutation-test-report-drawer/mutation-test-report-drawer.component';

const mutantTitle = (mutant: MutantModel) =>
  html`${mutant.id} ${getEmojiForStatus(mutant.status)} <code>${mutant.getMutatedLines()}</code> (${mutant.fileName}:${mutant.location.start
      .line}:${mutant.location.start.column})`;

@customElement('mutation-test-report-drawer-test')
export class MutationTestReportDrawerTestComponent extends LitElement {
  @property()
  public test?: TestModel;

  @property({ reflect: true })
  public mode: DrawerMode = 'closed';

  public static styles = [bootstrap];

  public render() {
    return html`<mutation-test-report-drawer ?hasDetail="${this.test?.killedMutants || this.test?.coveredMutants}" .mode="${this.mode}">
      ${renderIfPresent(
        this.test,
        (test) => html`
          <span slot="header"
            >${test.id} ${getEmojiForTestStatus(test.status)} ${test.name} [${test.status}]
            (${test.location!.start.line}:${test.location!.start.column})</span
          >
          <span slot="summary">${this.renderSummary()}</span>
          <span slot="detail">${this.renderDetail()}</span>
        `
      )}</mutation-test-report-drawer
    >`;
  }

  private renderSummary() {
    return html`<div class="d-flex mx-2">
      ${this.test?.killedMutants?.[0]
        ? html`<h6 class="pr-4"
            >🎯 Killed: ${mutantTitle(this.test.killedMutants?.[0])}
            ${this.test.killedMutants.length > 1 ? html`(and ${this.test.killedMutants.length - 1} more)` : ''}</h6
          >`
        : ''}
      ${renderIfPresent(
        this.test?.coveredMutants,
        (coveredMutants) =>
          html`<h6 class="pr-4">
            ☂️ Covered ${coveredMutants.length} mutant${plural(coveredMutants)}
            ${renderIf(this.test?.status === TestStatus.NotKilling, "(yet didn't kill any of them)")}
          </h6>`
      )}
    </div>`;
  }
  private renderDetail() {
    return html`<ul class="list-group">
      ${this.test?.killedMutants?.map(
        (mutant) => html`<li title="This test killed this mutant" class="list-group-item">🎯 ${mutantTitle(mutant)}</li>`
      )}
      ${this.test?.coveredMutants
        ?.filter((mutant) => !this.test?.killedMutants?.includes(mutant))
        .map((mutant) => html`<li class="list-group-item" title="This test covered this mutant">☂️ ${mutantTitle(mutant)}</li>`)}
    </ul>`;
  }
}
