import { WebElement, WebDriver } from 'selenium-webdriver';
import { ElementSelector } from './ElementSelector.po';

export class PageObject extends ElementSelector {
  constructor(protected readonly host: WebElement, protected readonly browser: WebDriver) {
    super(host);
  }

  public isDisplayed() {
    return this.host.isDisplayed();
  }
}
