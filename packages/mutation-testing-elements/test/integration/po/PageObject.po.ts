import { WebElement } from 'selenium-webdriver';
import { ElementSelector } from './ElementSelector.po';

export class PageObject extends ElementSelector {
  constructor(protected readonly host: WebElement) {
    super(host);
  }
}
