import { html, LitElement, unsafeCSS, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TestModel } from 'mutation-testing-metrics';
import { getContextClassForTestStatus } from '../../lib/htmlHelpers';
import style from './test.scss';
import { bootstrap } from '../../style';
import { createCustomEvent } from '../../lib/custom-events';

@customElement('mte-test')
export class MutationTestReportTestComponent extends LitElement {
  @property()
  public test: TestModel | undefined;

  @property()
  public active = false;

  @property()
  public show = true;

  public static styles = [bootstrap, unsafeCSS(style)];

  private readonly testClicked = (event: Event) => {
    this.active = !this.active;
    event.stopPropagation();
    this.dispatchTestSelected();
  };

  private dispatchTestSelected() {
    this.dispatchEvent(createCustomEvent('test-selected', { selected: this.active, test: this.test }, { bubbles: true, composed: true }));
  }

  public render() {
    // This part is newline significant, as it is rendered in a <code> block.
    // No unnecessary new lines
    return this.test && this.show
      ? html`<span class="badge bg-${this.active ? 'info' : getContextClassForTestStatus(this.test.status)}" @click="${this.testClicked}"
          >${this.test.id}</span
        >`
      : nothing;
  }
}
