import { customElement, html, LitElement, property, unsafeCSS } from 'lit-element';
import { nothing } from 'lit-html';
import { TestModel } from 'mutation-testing-metrics';
import { getContextClassForTestStatus } from '../../lib/htmlHelpers';
import style from './mutation-test-report-test.scss';
import { bootstrap } from '../../style';
import { createCustomEvent } from '../../lib/custom-events';

@customElement('mutation-test-report-test')
export class MutationTestReportTestComponent extends LitElement {
  @property()
  public test: TestModel | undefined;

  @property()
  public expand = false;

  @property()
  public show = true;

  public static styles = [bootstrap, unsafeCSS(style)];

  private readonly testClicked = (event: Event) => {
    this.expand = !this.expand;
    event.stopPropagation();
    this.dispatchEvent(createCustomEvent('test-selected', { selected: this.expand, test: this.test }, { bubbles: true, composed: true }));
  };

  public render() {
    // This part is newline significant, as it is rendered in a <code> block.
    // No unnecessary new lines
    return this.test && this.show
      ? html`<span class="badge badge-${this.expand ? 'info' : getContextClassForTestStatus(this.test.status)}" @click="${this.testClicked}"
          >${this.test.id}</span
        >`
      : nothing;
  }
}
