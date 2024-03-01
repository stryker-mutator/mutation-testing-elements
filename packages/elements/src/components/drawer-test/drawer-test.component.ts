import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { MutantModel, TestModel } from 'mutation-testing-metrics';
import { TestStatus } from 'mutation-testing-metrics';
import { describeLocation, getEmojiForTestStatus, plural, renderIfPresent } from '../../lib/html-helpers.js';
import { tailwind } from '../../style/index.js';
import { renderDetailLine, renderEmoji, renderSummaryContainer, renderSummaryLine } from '../drawer-mutant/util.js';
import type { DrawerMode } from '../drawer/drawer.component.js';
import { renderDrawer } from '../drawer/util.js';
import { RealTimeElement } from '../real-time-element.js';

const describeMutant = (mutant: MutantModel) => html`<code>${mutant.getMutatedLines()}</code> (${describeLocation(mutant)})`;

@customElement('mte-drawer-test')
export class MutationTestReportDrawerTestComponent extends RealTimeElement {
  @property()
  public declare test?: TestModel;

  @property({ reflect: true })
  public declare mode: DrawerMode;

  public static styles = [tailwind];

  constructor() {
    super();
    this.mode = 'closed';
  }

  public render() {
    return renderDrawer(
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- we want to coalesce on length 0
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
        `,
      ),
    );
  }

  private renderSummary() {
    return renderSummaryContainer(
      html`${this.test?.killedMutants?.[0]
        ? renderSummaryLine(
            html`${renderEmoji('🎯', 'killed')} Killed:
            ${describeMutant(this.test.killedMutants?.[0])}${this.test.killedMutants.length > 1
              ? html` (and ${this.test.killedMutants.length - 1} more)`
              : ''}`,
          )
        : nothing}
      ${renderIfPresent(this.test?.coveredMutants, (coveredMutants) =>
        renderSummaryLine(
          html`${renderEmoji('☂️', 'umbrella')} Covered ${coveredMutants.length}
          mutant${plural(coveredMutants)}${this.test?.status === TestStatus.Covering ? " (yet didn't kill any of them)" : ''}`,
        ),
      )}`,
    );
  }
  private renderDetail() {
    return html`<ul class="mb-6 mr-12">
      ${this.test?.killedMutants?.map((mutant) =>
        renderDetailLine('This test killed this mutant', html`${renderEmoji('🎯', 'killed')} ${describeMutant(mutant)}`),
      )}
      ${this.test?.coveredMutants
        ?.filter((mutant) => !this.test?.killedMutants?.includes(mutant))
        .map((mutant) => renderDetailLine('This test covered this mutant', html`${renderEmoji('☂️', 'umbrella')} ${describeMutant(mutant)}`))}
    </ul>`;
  }
}
