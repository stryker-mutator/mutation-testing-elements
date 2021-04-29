import { LitElement, customElement, property, html, unsafeCSS } from 'lit-element';
import { TestModel } from 'mutation-testing-metrics';
import { createCustomEvent } from '../../lib/custom-events';
import { getEmojiForTestStatus } from '../../lib/htmlHelpers';
import { bootstrap } from '../../style';
import style from './test-list-item.scss';

@customElement('mte-test-list-item')
export class MutationTestReportTestListItemComponent extends LitElement {
  @property()
  public test!: TestModel;

  @property({ reflect: true, type: Boolean })
  public active = false;

  @property({ type: Boolean })
  public show = true;

  public static styles = [bootstrap, unsafeCSS(style)];

  public readonly dispatchTestSelected = (event: Event) => {
    event.stopPropagation();
    this.active = !this.active;
    this.dispatchEvent(createCustomEvent('test-selected', { test: this.test, selected: this.active }, { bubbles: true, composed: true }));
  };

  public render() {
    return this.show
      ? html`<button type="button" @click="${this.dispatchTestSelected}" class="list-group-item list-group-item-action${this.active ? ' active' : ''}"
          ><span class="emblem">${getEmojiForTestStatus(this.test.status)}</span> ${this.test.name}${this.test.location
            ? html` (${this.test.location.start.line}:${this.test.location.start.column})`
            : ''}
          [${this.test.status}]</button
        >`
      : '';
  }
}
