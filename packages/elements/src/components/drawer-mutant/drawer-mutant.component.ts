import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MutantModel, TestModel } from 'mutation-testing-metrics';
import { MutantStatus } from 'mutation-testing-report-schema/api';
import { describeLocation, getEmojiForStatus, plural, renderIf, renderIfPresent } from '../../lib/html-helpers';
import { tailwind } from '../../style';
import { DrawerMode } from '../drawer/drawer.component';
import { renderDrawer } from '../drawer/util';
import { renderDetailLine, renderEmoji, renderSummaryContainer, renderSummaryLine } from './util';
import { RealtimeElement } from '../realtime-element';

const describeTest = (test: TestModel) => `${test.name}${test.sourceFile && test.location ? ` (${describeLocation(test)})` : ''}`;

@customElement('mte-drawer-mutant')
export class MutationTestReportDrawerMutant extends RealtimeElement {
  @property()
  public mutant?: MutantModel;

  @property({ reflect: true })
  public mode: DrawerMode = 'closed';

  public static styles = [tailwind];

  public render() {
    return renderDrawer(
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- we want to coalesce on length 0
      { hasDetail: Boolean(this.mutant?.killedByTests?.length || this.mutant?.coveredByTests?.length), mode: this.mode },
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
          test${plural(coveredTests)}${this.mutant?.status === MutantStatus.Survived ? ' (yet still survived)' : ''}`,
        ),
      )}
      ${renderIf(
        this.mutant?.statusReason?.trim(),
        renderSummaryLine(html`${renderEmoji('🕵️', 'spy')} ${this.mutant!.statusReason!}`, `Reason for the ${this.mutant!.status} status`),
      )}
      ${renderIfPresent(this.mutant?.description, (description) => renderSummaryLine(html`${renderEmoji('📖', 'book')} ${description}`))}`,
    );
  }

  private renderDetail() {
    return html`<ul class="mb-6 mr-12">
      ${this.mutant?.killedByTests?.map((test) =>
        renderDetailLine('This mutant was killed by this test', html`${renderEmoji('🎯', 'killed')} ${describeTest(test)}`),
      )}
      ${this.mutant?.coveredByTests
        ?.filter((test) => !this.mutant?.killedByTests?.includes(test))
        .map((test) => renderDetailLine('This mutant was covered by this test', html`${renderEmoji('☂️', 'umbrella')} ${describeTest(test)}`))}
    </ul>`;
  }
}
