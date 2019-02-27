import { By } from 'selenium-webdriver';
import { PageObject } from './PageObject.po.spec';

export default class Breadcrumb extends PageObject {

  public async items(): Promise<string[]> {
    const elements = await this.$$('li');
    return Promise.all(elements.map(e => e.getText()));
  }

  public async navigate(to: string): Promise<void> {
    const anchor = await this.host.findElement(By.linkText(to));
    await anchor.click();
  }
}
