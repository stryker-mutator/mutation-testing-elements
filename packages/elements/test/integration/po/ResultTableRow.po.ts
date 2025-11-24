import { PageObject } from './PageObject.po.js';
import { ProgressBar } from './ProgressBar.po.js';

export class ResultTableRow extends PageObject {
  readonly #nameTableElement = this.$.bind(this, 'td:nth-child(1)');
  public navigate = () => this.#nameTableElement().locator('a').click();
  public name = () => this.#nameTableElement().innerText();
  public progressBar = () => new ProgressBar(this.$('td:nth-child(2)>div.rounded-full'), this.browser);
  public mutationScore = () => this.$('td:nth-child(3)');
  public testStrengthProgressBar = () => new ProgressBar(this.$('td:nth-child(4)>div.rounded-full'), this.browser);
  public mutationScoreBasedOnCoveredCode = () => this.$('td:nth-child(5)');
  public killed = () => this.$('td:nth-child(6)');
  public survived = () => this.$('td:nth-child(7)');
  public timeout = () => this.$('td:nth-child(8)');
  public noCoverage = () => this.$('td:nth-child(9)');
  public ignored = () => this.$('td:nth-child(10)');
  public runtimeErrors = () => this.$('td:nth-child(11)');
  public compileErrors = () => this.$('td:nth-child(12)');
  public totalDetected = () => this.$('td:nth-child(13)');
  public totalUndetected = () => this.$('td:nth-child(14)');
  public totalMutants = () => this.$('td:nth-child(15)');
}
