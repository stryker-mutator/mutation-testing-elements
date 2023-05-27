import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MutantModel, TestModel, TestStatus } from 'mutation-testing-metrics';
import { describeLocation, getEmojiForTestStatus, plural, renderIfPresent } from '../../lib/html-helpers';
import { tailwind } from '../../style';
import { renderDetailLine, renderEmoji, renderSummaryContainer, renderSummaryLine } from '../drawer-mutant/util';
import { DrawerMode } from '../drawer/drawer.component';
import { renderDrawer } from '../drawer/util';
import { RealTimeElement } from '../real-time-element';

const describeMutant = (mutant: MutantModel) => html`<code>${mutant.getMutatedLines()}</code> (${describeLocation(mutant)})`;

@customElement('mte-drawer-test')
export class MutationTestReportDrawerTestComponent extends RealTimeElement {
  @property()
  public test?: TestModel;

  @property({ reflect: true })
  public mode: DrawerMode = 'closed';

  public static styles = [tailwind];

  public render() {
    return renderDrawer(
      { hasDetail: Boolean(this.test?.killedMutants?.length || this.test?.coveredMutants?.length), mode: this.mode },
      renderIfPresent(
        this.test,
        (test) => html`
          <span class="align-middle text-lg" slot="header"
            >${getEmojiForTestStatus(test.status)} ${test.name} [${test.status}]
            ${test.location ? html`(${test.location.start.line}:${test.location.start.column})` : nothing}</span
          >
          <span slot="summary">${this.renderSummary()}</span>
          <span class="block" slot="detail">${this.renderDetail()}</span>
        `
      )
    );
  }

  private renderSummary() {
    return renderSummaryContainer(html`${this.test?.killedMutants?.[0]
      ? renderSummaryLine(
          html`${renderEmoji('🎯', 'killed')} Killed:
          ${describeMutant(this.test.killedMutants?.[0])}${this.test.killedMutants.length > 1
            ? html` (and ${this.test.killedMutants.length - 1} more)`
            : ''}`
        )
      : nothing}
    ${renderIfPresent(this.test?.coveredMutants, (coveredMutants) =>
      renderSummaryLine(
        html`${renderEmoji('☂️', 'umbrella')} Covered ${coveredMutants.length}
        mutant${plural(coveredMutants)}${this.test?.status === TestStatus.Covering ? " (yet didn't kill any of them)" : ''}`
      )
    )}`);
  }
  private renderDetail() {
    return html`<ul class="mb-6 mr-12">
      ${this.test?.killedMutants?.map((mutant) =>
        renderDetailLine('This test killed this mutant', html`${renderEmoji('🎯', 'killed')} ${describeMutant(mutant)}`)
      )}
      ${this.test?.coveredMutants
        ?.filter((mutant) => !this.test?.killedMutants?.includes(mutant))
        .map((mutant) => renderDetailLine('This test covered this mutant', html`${renderEmoji('☂️', 'umbrella')} ${describeMutant(mutant)}`))}
    </ul>`;
  }
}
