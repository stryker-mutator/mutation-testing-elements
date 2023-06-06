import { MutationTestMetricsResult } from 'mutation-testing-metrics';
import { RealTimeElement } from '../real-time-element';
import { PropertyValues, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { tailwind } from '../../style';

interface ProgressBarMetrics {
  killed: number;
  survived: number;
  combined: number;
  [key: string]: number;
}

@customElement('mte-progress-bar')
export class ProgressBar extends RealTimeElement {
  public static styles = [tailwind];

  @property({ attribute: false })
  public rootModel: MutationTestMetricsResult | undefined;

  @property({ attribute: false })
  public metrics: ProgressBarMetrics | undefined;

  @property({ attribute: false })
  public total = 0;

  @property({ attribute: false })
  public visible = false;

  #observer: IntersectionObserver | undefined;
  #shouldBeSmall = false;

  public constructor() {
    super();
  }

  public connectedCallback(): void {
    super.connectedCallback();

    this.#observer = new window.IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.#shouldBeSmall = false;
      } else {
        this.#shouldBeSmall = true;
      }

      this.requestUpdate();
    });
    this.#observer.observe(this);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();

    this.#observer?.disconnect();
  }

  public reactivate(): void {
    super.reactivate();
    this.#calculateProgressBarMetrics();
  }

  public willUpdate(changedProperties: PropertyValues): void {
    if (changedProperties.has('rootModel')) {
      this.#calculateProgressBarMetrics();
    }
  }

  #calculateProgressBarMetrics() {
    const metrics = this.rootModel?.systemUnderTestMetrics.metrics;
    this.total = metrics?.totalMutants ?? 0;
    this.metrics = {
      killed: metrics?.killed ?? 0,
      survived: metrics?.survived ?? 0,
      combined:
        (metrics?.noCoverage ?? 0) +
        (metrics?.compileErrors ?? 0) +
        (metrics?.timeout ?? 0) +
        (metrics?.ignored ?? 0) +
        (metrics?.runtimeErrors ?? 0),
    };
  }

  public render() {
    if (this.metrics === undefined || !this.visible) {
      return nothing;
    }

    return html`
      ${this.#renderSmallParts()}
      <div class="my-4 rounded-md border border-gray-200 bg-white">
        <div class="relative">
          <div class="parts flex h-8 w-full overflow-hidden rounded bg-gray-200">${this.#renderParts()}</div>
        </div>
      </div>
    `;
  }

  #renderSmallParts() {
    return html`<div
      class="${this.#shouldBeSmall ? 'opacity-1' : 'opacity-0'} pointer-events-none fixed left-0 top-0 z-20 flex w-full justify-center transition-all"
    >
      <div class="container w-full bg-white py-2">
        <div class="flex h-2 overflow-hidden rounded bg-gray-200">${Object.keys(this.metrics!).map((metric) => this.#renderSmallPart(metric))}</div>
      </div>
    </div>`;
  }

  #renderSmallPart(metric: string) {
    return html`<div class="${this.#colorFromMetric(metric)} z-20 h-2 transition-all" style="width: ${this.#calculatePercentage(metric)}%"></div>`;
  }

  #renderParts() {
    return html`${Object.keys(this.metrics!).map((metric) => this.#renderPart(metric, this.metrics![metric]))}`;
  }

  #renderPart(metric: keyof ProgressBarMetrics, amount: number) {
    return html`<div
      style="width: ${this.#calculatePercentage(metric)}%"
      class="${this.#colorFromMetric(metric)} ${amount === 0 ? 'opacity-0' : ''} relative flex h-8 items-center overflow-hidden transition-all"
    >
      <span class="ms-3 font-bold text-gray-800">${amount}</span>
    </div>`;
  }

  #colorFromMetric(metric: keyof ProgressBarMetrics) {
    switch (metric) {
      case 'killed':
        return 'bg-green-600';
      case 'survived':
        return 'bg-red-600';
      case 'combined':
      default:
        return 'bg-yellow-600';
    }
  }

  #calculatePercentage(metric: keyof ProgressBarMetrics) {
    return this.total !== 0 ? (100 * this.metrics![metric]) / this.total : 0;
  }
}
