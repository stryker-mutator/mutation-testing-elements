import { ElementFinder } from './ElementFinder';
import { WebElement, By } from 'selenium-webdriver';
import { shadowRoot } from '../lib/helpers';

export class ElementSelector {
  constructor(private readonly context: ElementFinder) { }

  public async $$(cssSelector: string): Promise<WebElement[]> {
    const parts = cssSelector.split('>>>');
    const context = await this.findContext(parts.slice(0, parts.length - 1));
    return context.findElements(By.css(parts[parts.length - 1]));
  }

  public async $(cssSelector: string): Promise<WebElement> {
    const parts = cssSelector.split('>>>');
    const context = await this.findContext(parts.slice(0, parts.length - 1));
    return context.findElement(By.css(parts[parts.length - 1]));
  }

  private async findContext(webComponentPath: string[]) {
    let currentContext = this.context;
    for (const part of webComponentPath) {
      const host = await currentContext.findElement(By.css(part));
      const newContext = await shadowRoot(host);
      if (newContext) {
        currentContext = newContext;
      } else {
        throw new Error(`Cannot find shadow dom for ${part}`);
      }
    }
    return currentContext;
  }
}
