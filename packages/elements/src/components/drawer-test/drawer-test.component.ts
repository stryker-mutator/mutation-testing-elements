import { customElement, html, LitElement, property, unsafeCSS } from 'lit-element';
import { MutantModel, TestModel, TestStatus } from 'mutation-testing-metrics';
import { renderIfPresent, getEmojiForTestStatus, renderIf, plural, describeLocation } from '../../lib/htmlHelpers';
import { bootstrap } from '../../style';
import { DrawerMode } from '../drawer/drawer.component';
import style from './drawer-test.scss';

const describeMutant = (mutant: MutantModel) => html`${mutant.id} <code>${mutant.getMutatedLines()}</code> (${describeLocation(mutant)})`;

@customElement('mte-drawer-test')
export class MutationTestReportDrawerTestComponent extends LitElement {
  @property()
  public test?: TestModel;

  @property({ reflect: true })
  public mode: DrawerMode = 'closed';

  public static styles = [bootstrap, unsafeCSS(style)];

  public render() {
    return html`<mte-drawer ?hasDetail="${this.test?.killedMutants || this.test?.coveredMutants}" .mode="${this.mode}">
      ${renderIfPresent(
        this.test,
        (test) => html`
          <span slot="header"
            >${test.id} ${getEmojiForTestStatus(test.status)} ${test.name} [${test.status}]
            ${test.location ? html`(${test.location.start.line}:${test.location.start.column})` : ''}</span
          >
          <span slot="summary">${this.renderSummary()}</span>
          <span slot="detail">${this.renderDetail()}</span>
        `
      )}</mte-drawer
    >`;
  }

  private renderSummary() {
    return html`<div class="d-flex mx-2">
      ${this.test?.killedMutants?.[0]
        ? html`<h6 class="pe-4"
            >🎯 Killed: ${describeMutant(this.test.killedMutants?.[0])}
            ${this.test.killedMutants.length > 1 ? html`(and ${this.test.killedMutants.length - 1} more)` : ''}</h6
          >`
        : ''}
      ${renderIfPresent(
        this.test?.coveredMutants,
        (coveredMutants) =>
          html`<h6 class="pe-4">
            ☂️ Covered ${coveredMutants.length} mutant${plural(coveredMutants)}
            ${renderIf(this.test?.status === TestStatus.Covering, "(yet didn't kill any of them)")}
          </h6>`
      )}
    </div>`;
  }
  private renderDetail() {
    return html`<ul class="list-group">
      ${this.test?.killedMutants?.map(
        (mutant) => html`<li title="This test killed this mutant" class="list-group-item">🎯 ${describeMutant(mutant)}</li>`
      )}
      ${this.test?.coveredMutants
        ?.filter((mutant) => !this.test?.killedMutants?.includes(mutant))
        .map((mutant) => html`<li class="list-group-item" title="This test covered this mutant">☂️ ${describeMutant(mutant)}</li>`)}
    </ul>`;
  }
}
