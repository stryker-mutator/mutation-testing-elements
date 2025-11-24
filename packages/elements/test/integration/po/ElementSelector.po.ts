import type { Locator } from '@playwright/test';

export class ElementSelector {
  readonly #context: Locator;
  constructor(context: Locator) {
    this.#context = context;
  }

  public $$(cssSelector: string): Promise<Locator[]> {
    return this.#context.locator(cssSelector).all();
  }

  public $(cssSelector: string): Locator {
    return this.#context.locator(cssSelector);
  }
}
