import type { TemplateResult } from 'lit';
import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import type { MutantModel, TestModel } from 'mutation-testing-metrics';

import { describeLocation, getEmojiForStatus, plural, renderIf, renderIfPresent } from '../../lib/html-helpers.js';
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
  public declare mutant?: MutantModel;

  @property({ reflect: true })
  public declare mode: DrawerMode;

  constructor() {
    super();
    this.mode = 'closed';
  }

  public render() {
    return renderDrawer(
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- we want to coalesce on length 0
      { hasDetail: Boolean(this.mutant?.killedByTests?.length || this.mutant?.coveredByTests?.length || this.mutant?.statusReason), mode: this.mode },
      renderIfPresent(
        this.mutant,
        (mutant) => html`
          <span class="align-middle text-lg" slot="header"
            >${getEmojiForStatus(mutant.status)} ${mutant.mutatorName} ${mutant.status}
            (${mutant.location.start.line}:${mutant.location.start.column})</span
          >
          <span slot="summary">${this.renderSummary()}</span>
          <span slot="detail" class="block">${this.renderDetail()}</span>
        `,
      ),
    );
  }

  private renderSummary() {
    return renderSummaryContainer(
      html`${this.mutant?.killedByTests?.[0]
        ? renderSummaryLine(
            html`${renderEmoji('🎯', 'killed')} Killed by:
            ${this.mutant.killedByTests?.[0].name}${this.mutant.killedByTests.length > 1 ? `(and ${this.mutant.killedByTests.length - 1} more)` : ''}`,
          )
        : nothing}
      ${renderIf(this.mutant?.static, renderSummaryLine(html`${renderEmoji('🗿', 'static')} Static mutant`))}
      ${renderIfPresent(this.mutant?.coveredByTests, (coveredTests) =>
        renderSummaryLine(
          html`${renderEmoji('☂️', 'umbrella')} Covered by ${coveredTests.length}
          test${plural(coveredTests)}${this.mutant?.status === 'Survived' ? ' (yet still survived)' : ''}`,
        ),
      )}
      ${renderIf(
        this.mutant?.statusReason?.trim(),
        renderSummaryLine(
          html`${renderEmoji('🕵️', 'spy')} ${whitespacePreserving(this.mutant!.statusReason!)}`,
          `Reason for the ${this.mutant!.status} status`,
        ),
      )}
      ${renderIfPresent(this.mutant?.description, (description) =>
        renderSummaryLine(html`${renderEmoji('📖', 'book')} ${whitespacePreserving(description)}`),
      )}`,
    );
  }

  private renderDetail() {
    return html`<ul class="mb-6 mr-2">
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
