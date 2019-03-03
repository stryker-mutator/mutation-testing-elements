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

  public $(selector: string): HTMLElement {
    return (this.element.shadowRoot as ShadowRoot).querySelector(selector) as HTMLElement;
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
