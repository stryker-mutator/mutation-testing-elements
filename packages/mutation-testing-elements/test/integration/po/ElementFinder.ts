import { Locator, WebElement } from 'selenium-webdriver';

export interface ElementFinder {
  findElements(locator: Locator): PromiseLike<WebElement[]>;
  findElement(locator: Locator): PromiseLike<WebElement>;
  getTagName?(): PromiseLike<string>;
}
