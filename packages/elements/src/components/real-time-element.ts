import { Subscription } from 'rxjs';

import { mutantChanges } from '../lib/mutant-changes.js';
import { BaseElement } from './base-element.js';

export abstract class RealTimeElement extends BaseElement {
  public shouldReactivate(): boolean {
    return true;
  }

  public reactivate() {
    this.requestUpdate();
  }

  #subscription = new Subscription();
  override connectedCallback(): void {
    super.connectedCallback();
    this.#subscription.add(mutantChanges.subscribe(() => this.shouldReactivate() && this.reactivate()));
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#subscription.unsubscribe();
  }
}
