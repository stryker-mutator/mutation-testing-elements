import { WebElement, By } from 'selenium-webdriver';
import { ElementFinder } from './ElementFinder.spec';

export class PageObject {
  constructor(protected readonly host: ElementFinder) { }

  public async $$(cssSelector: string): Promise<WebElement[]> {
    const elements = await this.host.findElements(By.css(cssSelector));
    return elements;
  }

  public async $(cssSelector: string): Promise<WebElement> {
    const element = await this.host.findElement(By.css(cssSelector));
    return element;
  }
}
