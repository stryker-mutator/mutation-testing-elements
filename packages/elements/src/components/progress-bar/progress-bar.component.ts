import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { tailwind } from '../../style';

type ProgressType = 'detected' | 'undetected' | 'ignored + invalid' | 'pending';
type ProgressMetric = { type: ProgressType; amount: number; tooltip: string };

@customElement('mte-progress-bar')
export class ProgressBar extends LitElement {
  public static styles = [tailwind];

  @property({ attribute: false })
  public detected = 0;

  @property({ attribute: false })
  public undetected = 0;

  @property({ attribute: false })
  public invalid = 0;

  @property({ attribute: false })
  public ignored = 0;

  @property({ attribute: false })
  public pending = 0;

  @property({ attribute: false })
  public total = 0;

  @state()
  private shouldBeSmall = false;

  #observer: IntersectionObserver | undefined;

  public constructor() {
    super();
  }

  public connectedCallback(): void {
    super.connectedCallback();

    // This code is responsible for making the small progress-bar show up.
    // Once this element (the standard progress-bar) is no longer intersecting (visible) the viewable window,
    // the smaller progress-bar will show up at the top if the window.
    // If this element is visible, the smaller progress-bar will fade out and it will no longer be visible.
    this.#observer = new window.IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.shouldBeSmall = false;
      } else {
        this.shouldBeSmall = true;
      }

      this.requestUpdate();
    });
    this.#observer.observe(this);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();

    this.#observer?.disconnect();
  }

  public render() {
    return html`
      ${this.#renderSmallParts()}
      <div class="my-4 rounded-md border border-gray-200 bg-white transition-all">
        <div class="relative">
          <div class="parts flex h-8 w-full overflow-hidden rounded bg-gray-200">${this.#renderParts()}</div>
        </div>
      </div>
    `;
  }

  #renderSmallParts() {
    return html`<div
      class="${this.shouldBeSmall ? 'opacity-1' : 'opacity-0'} pointer-events-none fixed left-0 top-0 z-20 flex w-full justify-center transition-all"
    >
      <div class="container w-full bg-white py-2">
        <div class="flex h-2 overflow-hidden rounded bg-gray-200">${this.#getMetrics().map((metric) => this.#renderSmallPart(metric))}</div>
      </div>
    </div>`;
  }

  #renderSmallPart(metric: ProgressMetric) {
    return html`<div
      class="${this.#colorFromMetric(metric.type)} z-20 h-2 transition-all"
      style="width: ${this.#calculatePercentage(metric.amount)}%"
    ></div>`;
  }

  #renderParts() {
    return html`${this.#getMetrics().map((metric) => this.#renderPart(metric))}`;
  }

  #renderPart(metric: ProgressMetric) {
    return html`<div
      title="${metric.tooltip}"
      style="width: ${this.#calculatePercentage(metric.amount)}%"
      class="${this.#colorFromMetric(metric.type)} ${metric.amount === 0
        ? 'opacity-0'
        : ''} relative flex h-8 items-center overflow-hidden transition-all"
    >
      <span class="ms-3 font-bold text-gray-800">${metric.amount}</span>
    </div>`;
  }

  #getMetrics(): Array<ProgressMetric> {
    return [
      { type: 'detected', amount: this.detected, tooltip: 'killed + timeout' },
      { type: 'undetected', amount: this.undetected, tooltip: 'survived + no coverage' },
      { type: 'ignored + invalid', amount: this.ignored + this.invalid, tooltip: 'ignored + runtime error + compile error' },
      { type: 'pending', amount: this.pending, tooltip: 'pending' },
    ];
  }

  #colorFromMetric(metric: ProgressType) {
    switch (metric) {
      case 'detected':
        return 'bg-green-600';
      case 'undetected':
        return 'bg-red-600';
      case 'ignored + invalid':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-200';
    }
  }

  #calculatePercentage(metric: number) {
    return this.total !== 0 ? (100 * metric) / this.total : 0;
  }
}
