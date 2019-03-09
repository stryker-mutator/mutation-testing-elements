import { WebElement } from 'selenium-webdriver';
import { ElementFinder } from '../po/ElementFinder';
import { getCurrent } from './browser';

export async function shadowRoot(element: ElementFinder): Promise<WebElement> {
  const shadowRoot = await getCurrent().executeScript<WebElement | undefined>('return arguments[0].shadowRoot', element);
  if (shadowRoot) {
    return shadowRoot;
  } else {
    if (element.getTagName) {
      const tagName = await element.getTagName();
      throw new Error(`Tag ${tagName} does not have a shadow root`);
    } else {
      throw new Error('No shadow root');
    }
  }
}
