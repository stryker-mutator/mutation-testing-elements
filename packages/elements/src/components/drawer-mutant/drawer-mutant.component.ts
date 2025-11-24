import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';
import type { MutantModel, TestModel } from 'mutation-testing-metrics';

import { describeLocation, getEmojiForStatus, plural } from '../../lib/html-helpers.js';
import type { DrawerMode } from '../drawer/drawer.component.js';
import { renderDrawer } from '../drawer/util.js';
import { RealTimeElement } from '../real-time-element.js';
import { renderDetailLine, renderEmoji, renderSummaryContainer, renderSummaryLine } from './util.js';

const describeTest = (test: TestModel) => `${test.name}${test.sourceFile && test.location ? ` (${describeLocation(test)})` : ''}`;

/**
 * Wrap so that the whitespace is preserved when rendered
 */
const whitespacePreserving = (content: string | TemplateResult) => html`<span class="whitespace-pre-wrap">${content}</span>`;

@customElement('mte-drawer-mutant')
export class MutationTestReportDrawerMutant extends RealTimeElement {
  @property({ attribute: false })
  declare public mutant?: MutantModel;

  @property({ reflect: true })
  declare public mode: DrawerMode;

  constructor() {
    super();
    this.mode = 'closed';
  }

  public render() {
    return renderDrawer(
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- we want to coalesce on length 0
      { hasDetail: Boolean(this.mutant?.killedByTests?.length || this.mutant?.coveredByTests?.length || this.mutant?.statusReason), mode: this.mode },
      when(
        this.mutant,
        (mutant) =>
          html`<span class="align-middle text-lg" slot="header"
              >${getEmojiForStatus(mutant.status)} ${mutant.mutatorName} ${mutant.status}
              (${mutant.location.start.line}:${mutant.location.start.column})</span
            >
            <span slot="summary">${this.#renderSummary()}</span>
            <span slot="detail" class="block">${this.#renderDetail()}</span>`,
      ),
    );
  }

  #renderSummary() {
    return renderSummaryContainer(
      html`${when(this.mutant?.killedByTests?.[0], (killedByTests) =>
        renderSummaryLine(
          html`${renderEmoji('🎯', 'killed')} Killed by:
          ${killedByTests.name}${this.mutant!.killedByTests!.length > 1 ? `(and ${this.mutant!.killedByTests!.length - 1} more)` : ''}`,
        ),
      )}
      ${when(this.mutant?.static, () => renderSummaryLine(html`${renderEmoji('🗿', 'static')} Static mutant`))}
      ${when(this.mutant?.coveredByTests, (coveredTests) =>
        renderSummaryLine(
          html`${renderEmoji('☂️', 'umbrella')} Covered by ${coveredTests.length}
          test${plural(coveredTests)}${this.mutant?.status === 'Survived' ? ' (yet still survived)' : ''}`,
        ),
      )}
      ${when(this.mutant?.statusReason?.trim(), (reason) =>
        renderSummaryLine(html`${renderEmoji('🕵️', 'spy')} ${whitespacePreserving(reason)}`, `Reason for the ${this.mutant!.status} status`),
      )}
      ${when(this.mutant?.description, (description) => renderSummaryLine(html`${renderEmoji('📖', 'book')} ${whitespacePreserving(description)}`))}`,
    );
  }

  #renderDetail() {
    return html`<ul class="mr-2 mb-6">
      ${map(this.mutant?.killedByTests, (test) =>
        renderDetailLine('This mutant was killed by this test', html`${renderEmoji('🎯', 'killed')} ${describeTest(test)}`),
      )}
      ${map(
        this.mutant?.coveredByTests?.filter((test) => !this.mutant?.killedByTests?.includes(test)),
        (test) => renderDetailLine('This mutant was covered by this test', html`${renderEmoji('☂️', 'umbrella')} ${describeTest(test)}`),
      )}
    </ul>`;
  }
}
