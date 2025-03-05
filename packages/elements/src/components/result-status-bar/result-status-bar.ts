import { IntersectionController } from '@lit-labs/observers/intersection-controller.js';
import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { BaseElement } from '../base-element.js';

type ProgressType = 'detected' | 'survived' | 'no coverage' | 'pending';

interface ProgressMetric {
  type: ProgressType;
  amount: number;
  tooltip: string;
}

@customElement('mte-result-status-bar')
export class ResultStatusBar extends BaseElement {
  @property({ type: Number })
  declare public detected: number;

  @property({ type: Number, attribute: 'no-coverage' })
  declare public noCoverage: number;

  @property({ type: Number })
  declare public pending: number;

  @property({ type: Number })
  declare public survived: number;

  @property({ type: Number })
  declare public total: number;

  #shouldBeSmallController: IntersectionController<boolean>;

  public constructor() {
    super();
    this.detected = 0;
    this.noCoverage = 0;
    this.pending = 0;
    this.survived = 0;
    this.total = 0;

    // This code is responsible for making the small progress-bar show up.
    // Once this element (the standard progress-bar) is no longer intersecting (visible) the viewable window,
    // the smaller progress-bar will show up at the top if the window.
    // If this element is visible, the smaller progress-bar will fade out and it will no longer be visible.
    this.#shouldBeSmallController = new IntersectionController(this, {
      callback: ([entry]) => {
        return !entry.isIntersecting;
      },
    });
  }

  public render() {
    return html`
      ${this.#renderSmallParts()}
      <div class="my-4 rounded-md border border-gray-200 bg-white transition-all">
        <div class="parts flex h-8 w-full overflow-hidden rounded-sm bg-gray-200">${this.#renderParts()}</div>
      </div>
    `;
  }

  #renderSmallParts() {
    return html`<div
      class="${this.#shouldBeSmallController.value
        ? 'opacity-100'
        : 'opacity-0'} pointer-events-none fixed top-offset left-0 z-20 flex w-full justify-center transition-all"
    >
      <div class="container w-full bg-white py-2">
        <div class="flex h-2 overflow-hidden rounded-sm bg-gray-200">${this.#getMetrics().map((metric) => this.#renderPart(metric, true))}</div>
      </div>
    </div>`;
  }

  #renderParts() {
    return this.#getMetrics().map((metric) => this.#renderPart(metric, false));
  }

  #renderPart(metric: ProgressMetric, shouldBeSmall: boolean) {
    return html`<div
      title="${shouldBeSmall ? nothing : metric.tooltip}"
      style="width: ${this.#calculatePercentage(metric.amount)}%"
      class="${this.#colorFromMetric(metric.type)} ${metric.amount === 0 ? 'opacity-0' : 'opacity-100'} relative flex items-center overflow-hidden"
      >${shouldBeSmall ? nothing : html`<span class="ms-3 font-bold text-gray-800">${metric.amount}</span>`}
    </div>`;
  }

  #getMetrics(): ProgressMetric[] {
    return [
      { type: 'detected', amount: this.detected, tooltip: `killed + timeout (${this.detected})` },
      { type: 'survived', amount: this.survived, tooltip: `survived (${this.survived})` },
      { type: 'no coverage', amount: this.noCoverage, tooltip: `no coverage (${this.noCoverage})` },
      { type: 'pending', amount: this.pending, tooltip: `pending` },
    ];
  }

  #colorFromMetric(metric: ProgressType) {
    switch (metric) {
      case 'detected':
        return 'bg-green-600';
      case 'survived':
        return 'bg-red-600';
      case 'no coverage':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-200';
    }
  }

  #calculatePercentage(metric: number) {
    return this.total !== 0 ? (100 * metric) / this.total : 0;
  }
}
