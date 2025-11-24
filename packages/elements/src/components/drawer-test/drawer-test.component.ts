import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';
import type { MutantModel, TestModel } from 'mutation-testing-metrics';
import { TestStatus } from 'mutation-testing-metrics';

import { describeLocation, getEmojiForTestStatus, plural } from '../../lib/html-helpers.js';
import type { DrawerMode } from '../drawer/drawer.component.js';
import { renderDrawer } from '../drawer/util.js';
import { renderDetailLine, renderEmoji, renderSummaryContainer, renderSummaryLine } from '../drawer-mutant/util.js';
import { RealTimeElement } from '../real-time-element.js';

const describeMutant = (mutant: MutantModel) => html`<code>${mutant.getMutatedLines()}</code> (${describeLocation(mutant)})`;

@customElement('mte-drawer-test')
export class MutationTestReportDrawerTestComponent extends RealTimeElement {
  @property({ attribute: false })
  declare public test?: TestModel;

  @property({ reflect: true })
  declare public mode: DrawerMode;

  constructor() {
    super();
    this.mode = 'closed';
  }

  public render() {
    return renderDrawer(
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- we want to coalesce on length 0
      { hasDetail: Boolean(this.test?.killedMutants?.length || this.test?.coveredMutants?.length), mode: this.mode },
      when(
        this.test,
        (test) =>
          html`<span class="align-middle text-lg" slot="header"
              >${getEmojiForTestStatus(test.status)} ${test.name} [${test.status}]
              ${when(test.location, (location) => html`(${location.start.line}:${location.start.column})`)}</span
            >
            <span slot="summary">${this.#renderSummary()}</span>
            <span class="block" slot="detail">${this.#renderDetail()}</span>`,
      ),
    );
  }

  #renderSummary() {
    return renderSummaryContainer(
      html`${when(this.test?.killedMutants?.[0], (firstKilled) =>
        renderSummaryLine(
          html`${renderEmoji('🎯', 'killed')} Killed:
          ${describeMutant(firstKilled)}${this.test!.killedMutants!.length > 1 ? html` (and ${this.test!.killedMutants!.length - 1} more)` : ''}`,
        ),
      )}
      ${when(this.test?.coveredMutants, (coveredMutants) =>
        renderSummaryLine(
          html`${renderEmoji('☂️', 'umbrella')} Covered ${coveredMutants.length}
          mutant${plural(coveredMutants)}${this.test?.status === TestStatus.Covering ? " (yet didn't kill any of them)" : ''}`,
        ),
      )}`,
    );
  }
  #renderDetail() {
    return html`<ul class="mr-2 mb-6">
      ${map(this.test?.killedMutants, (mutant) =>
        renderDetailLine('This test killed this mutant', html`${renderEmoji('🎯', 'killed')} ${describeMutant(mutant)}`),
      )}
      ${map(
        this.test?.coveredMutants?.filter((mutant) => !this.test?.killedMutants?.includes(mutant)),
        (mutant) => renderDetailLine('This test covered this mutant', html`${renderEmoji('☂️', 'umbrella')} ${describeMutant(mutant)}`),
      )}
    </ul>`;
  }
}
