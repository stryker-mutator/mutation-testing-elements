import { WebElement, WebElementPromise } from 'selenium-webdriver';
import { getCurrent } from './browser';

export function selectShadowRoot(element: WebElement): WebElementPromise {
  return wrapInWebElementPromise(async () => {
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
  });
}

export function wrapInWebElementPromise(p: () => Promise<WebElement>) {
  return new WebElementPromise(getCurrent(), p());
}
