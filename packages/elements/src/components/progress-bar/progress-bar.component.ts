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

const METRICS_AMOUNT = 3;

@customElement('mte-progress-bar')
export class ProgressBar extends RealTimeElement {
  public static styles = [tailwind];

  @property({ attribute: false })
  public rootModel: MutationTestMetricsResult | undefined;

  @property({ attribute: false })
  public visible = false;

  #total = 0;
  #metrics: ProgressBarMetrics | undefined;

  connectedCallback(): void {
    super.connectedCallback();
  }

  public reactivate(): void {
    super.reactivate();
    this.#calculateProgressBarMetrics();
  }

  public updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('rootModel')) {
      this.#calculateProgressBarMetrics();
      this.requestUpdate();
    }
  }

  #calculateProgressBarMetrics() {
    const metrics = this.rootModel?.systemUnderTestMetrics.metrics;
    this.#total = metrics?.totalMutants ?? 0;
    this.#metrics = {
      killed: metrics?.killed ?? 0,
      survived: metrics?.survived ?? 0,
      combined: (metrics?.noCoverage ?? 0) + (metrics?.compileErrors ?? 0) + (metrics?.timeout ?? 0) + (metrics?.ignored ?? 0),
    };
  }

  public render() {
    if (this.#metrics === undefined || !this.visible) {
      return nothing;
    }

    return html`
      <div class="my-4 rounded-md border border-gray-200 bg-white p-3">
        ${this.#renderTitle()}
        <div class="relative">
          <div class="flex h-8 w-full overflow-hidden rounded bg-gray-200">${this.#renderParts()}</div>
          ${this.#renderTotalMutants()}
        </div>
      </div>
    `;
  }

  #renderTitle() {
    return html`
      <span class="mb-1 block text-base font-black text-gray-800">
        ${this.rootModel?.systemUnderTestMetrics.metrics.pending === 0 ? 'Mutation testing finished!' : 'Mutation testing in progress...'}
      </span>
    `;
  }

  #renderParts() {
    return html`${Object.keys(this.#metrics!).map((metric, index) => this.#renderPart(metric, index, this.#metrics![metric]))}`;
  }

  #renderPart(metric: keyof ProgressBarMetrics, index: number, amount: number) {
    const color = this.#colorFromStat(metric);
    return html`<div
      style="width: ${(100 * amount) / this.#total}%"
      class="${color} ${amount === 0 ? 'opacity-0' : ''} z-${METRICS_AMOUNT - index}0 relative flex h-8 items-center rounded-r transition-all"
    >
      <div class="${color} absolute -m-2 h-8 w-2"></div>
      <span class="ms-3 font-bold text-gray-800">${amount}</span>
    </div>`;
  }

  #colorFromStat(metric: keyof ProgressBarMetrics) {
    switch (metric) {
      case 'killed':
        return 'bg-green-600 outline-green-600';
      case 'survived':
        return 'bg-red-600 outline-red-600';
      case 'combined':
      default:
        return 'bg-yellow-600 outline-yellow-600';
    }
  }

  #renderTotalMutants() {
    return html`<span class="absolute bottom-0 right-0 flex h-8 items-center pr-3 font-bold text-gray-800">${this.#total}</span>`;
  }
}
