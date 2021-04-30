import { customElement, html, LitElement, property, unsafeCSS } from 'lit-element';
import { MutantModel, TestModel } from 'mutation-testing-metrics';
import { MutantStatus } from 'mutation-testing-report-schema';
import { describeLocation, getEmojiForStatus, plural, renderIf, renderIfPresent } from '../../lib/htmlHelpers';
import { bootstrap } from '../../style';
import { DrawerMode } from '../drawer/drawer.component';
import style from './drawer-mutant.scss';

const describeTest = (test: TestModel) => html`${test.name}${test.sourceFile && test.location ? ` (${describeLocation(test)})` : ''}`;

@customElement('mte-drawer-mutant')
export class MutationTestReportDrawerMutant extends LitElement {
  @property()
  public mutant?: MutantModel;

  @property({ reflect: true })
  public mode: DrawerMode = 'closed';

  public static styles = [bootstrap, unsafeCSS(style)];

  public render() {
    return html`<mte-drawer ?hasDetail="${this.mutant?.killedByTests || this.mutant?.coveredByTests}" .mode="${this.mode}">
      ${renderIfPresent(
        this.mutant,
        (mutant) => html`
          <span slot="header"
            >${mutant.id} ${getEmojiForStatus(mutant.status)} ${mutant.mutatorName} ${mutant.status}
            (${mutant.location.start.line}:${mutant.location.start.column})</span
          >
          <span slot="summary">${this.renderSummary()}</span>
          <span slot="detail">${this.renderDetail()}</span>
        `
      )}
    </mte-drawer>`;
  }

  private renderSummary() {
    return html`<div class="d-flex mx-2">
      ${this.mutant?.killedByTests?.[0]
        ? html`<h6 class="pr-4"
            >🎯 Killed by: ${this.mutant.killedByTests?.[0].name}
            ${this.mutant.killedByTests.length > 1 ? html`(and ${this.mutant.killedByTests.length - 1} more)` : undefined}</h6
          >`
        : undefined}
      ${renderIf(
        this.mutant?.static || this.mutant?.coveredByTests,
        html`<h6 class="pr-4">
          ${this.mutant?.static
            ? html`🗿 Static mutant`
            : renderIfPresent(
                this.mutant?.coveredByTests,
                (coveredTests) =>
                  html`☂️ Covered by ${coveredTests.length} test${plural(coveredTests)}
                  ${renderIf(this.mutant?.status === MutantStatus.Survived, '(yet still survived)')}`
              )}
        </h6>`
      )}
      ${renderIfPresent(this.mutant?.description, (description) => html`<h6>📖 ${description}</h6>`)}
    </div>`;
  }

  private renderDetail() {
    return html`<ul class="list-group">
      ${this.mutant?.killedByTests?.map(
        (test) => html`<li title="This mutant was killed by this test" class="list-group-item">🎯 ${describeTest(test)}</li>`
      )}
      ${this.mutant?.coveredByTests
        ?.filter((test) => !this.mutant?.killedByTests?.includes(test))
        .map((test) => html`<li class="list-group-item" title="This mutant was covered by this test">☂️ ${describeTest(test)}</li>`)}
    </ul>`;
  }
}
