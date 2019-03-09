import { PageObject } from './PageObject.po';
import { By } from 'selenium-webdriver';
import { ProgressBar } from './ProgressBar.po';

export class ResultTableRow extends PageObject {

  private readonly nameTableElement = this.$.bind(this, 'td:nth-child(2)');
  public navigate = async () => (await this.nameTableElement()).findElement(By.css('a')).click();
  public name = async () => (await this.nameTableElement()).getText();
  public progressBar = async () => new ProgressBar(await this.$('td:nth-child(3)>div.progress'));
  public mutationScore = async () => (await this.$('th:nth-child(4)')).getText();
  public killed = async () => (await this.$('td:nth-child(5)')).getText();
  public survived = async () => (await this.$('td:nth-child(6)')).getText();
  public timeout = async () => (await this.$('td:nth-child(7)')).getText();
  public noCoverage = async () => (await this.$('td:nth-child(8)')).getText();
  public runtimeErrors = async () => (await this.$('td:nth-child(9)')).getText();
  public compileErrors = async () => (await this.$('td:nth-child(10)')).getText();
  public totalDetected = async () => (await this.$('th:nth-child(11)')).getText();
  public totalUndetected = async () => (await this.$('th:nth-child(12)')).getText();
  public totalMutants = async () => (await this.$('th:nth-child(13)')).getText();
}
