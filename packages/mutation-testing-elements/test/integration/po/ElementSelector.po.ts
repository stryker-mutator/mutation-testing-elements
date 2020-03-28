import { ElementFinder } from './ElementFinder';
import { WebElement, By, WebElementPromise } from 'selenium-webdriver';
import { selectShadowRoot, wrapInWebElementPromise } from '../lib/helpers';
import { getCurrent } from '../lib/browser';

export class ElementSelector {
  constructor(private readonly context: ElementFinder) {}

  public async $$(cssSelector: string): Promise<WebElement[]> {
    const parts = cssSelector.split('>>>');
    const context = await this.findContext(parts.slice(0, parts.length - 1));
    return context.findElements(By.css(parts[parts.length - 1]));
  }

  public $(cssSelector: string): WebElementPromise {
    return wrapInWebElementPromise(async () => {
      const parts = cssSelector.split('>>>');
      const context = await this.findContext(parts.slice(0, parts.length - 1));
      return context.findElement(By.css(parts[parts.length - 1]));
    });
  }

  /**
   * Waits a bit for an element to become present. If not resolves false.
   * @param cssSelector The css selector (can contain shadow selector `>>>`)
   */
  public async isPresent(cssSelector: string): Promise<boolean> {
    const step = 100;
    const seconds = 3;
    const maxAttempts = seconds * 1000 / step;
    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      try {
        await this.$(cssSelector);
        return true;
      } catch {
        await getCurrent().sleep(step);
      }
    }
    return false;
  }

  private async findContext(webComponentPath: string[]) {
    let currentContext = this.context;
    for (const part of webComponentPath) {
      const shadedElement = part.trim().length === 0 ? currentContext : currentContext.findElement(By.css(part));
      const newContext = await selectShadowRoot(shadedElement as WebElement);
      if (newContext) {
        currentContext = newContext;
      } else {
        throw new Error(`Cannot find shadow dom for ${part}`);
      }
    }
    return currentContext;
  }
}
