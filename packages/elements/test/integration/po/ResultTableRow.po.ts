import { PageObject } from './PageObject.po.js';
import { ProgressBar } from './ProgressBar.po.js';

export class ResultTableRow extends PageObject {
  private readonly nameTableElement = this.$.bind(this, 'td:nth-child(1)');
  public navigate = () => this.nameTableElement().locator('a').click();
  public name = () => this.nameTableElement().innerText();
  public progressBar = () => new ProgressBar(this.$('td:nth-child(2)>div.rounded-full'), this.browser);
  public mutationScore = () => this.$('td:nth-child(3)');
  public killed = () => this.$('td:nth-child(4)');
  public survived = () => this.$('td:nth-child(5)');
  public timeout = () => this.$('td:nth-child(6)');
  public noCoverage = () => this.$('td:nth-child(7)');
  public ignored = () => this.$('td:nth-child(8)');
  public runtimeErrors = () => this.$('td:nth-child(9)');
  public compileErrors = () => this.$('td:nth-child(10)');
  public totalDetected = () => this.$('td:nth-child(11)');
  public totalUndetected = () => this.$('td:nth-child(12)');
  public totalMutants = () => this.$('td:nth-child(13)');
}
