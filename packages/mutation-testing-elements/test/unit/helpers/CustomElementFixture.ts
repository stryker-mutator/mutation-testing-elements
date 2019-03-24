import { LitElement } from 'lit-element';

export class CustomElementFixture<TCustomElement extends LitElement> {
  public readonly element: TCustomElement;

  constructor(nodeName: string) {
    this.element = document.createElement(nodeName) as TCustomElement;
    document.body.append(this.element);
  }

  public get updateComplete() {
    return this.element.updateComplete;
  }

  public waitFor(action: () => boolean, timeout = 500) {
    const step = 50;
    return new Promise((res, rej) => {
      function tick(timeLeft: number) {
        if (action()) {
          res();
        } else if (timeLeft <= 0) {
          rej(new Error(`Condition not met in ${timeout} ms: ${action}`));
        } else {
          setTimeout(() => tick(timeLeft - step), step);
        }
      }
      tick(timeout);
    });
  }

  public $(selector: string, inShadow = true): HTMLElement {
    if (inShadow) {
      return (this.element.shadowRoot as ShadowRoot).querySelector(selector) as HTMLElement;
    } else {
      return this.element.querySelector(selector) as HTMLElement;
    }
  }

  public $$(selector: string): Element[] {
    return [...(this.element.shadowRoot as ShadowRoot).querySelectorAll(selector)];
  }

  public get style(): CSSStyleDeclaration {
    return getComputedStyle(this.element);
  }

  public dispose() {
    return this.element.remove();
  }
}
