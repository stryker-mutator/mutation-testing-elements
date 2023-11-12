import type { Locator } from '@playwright/test';

export class ElementSelector {
  constructor(private readonly context: Locator) {}

  public $$(cssSelector: string): Promise<Locator[]> {
    return this.context.locator(cssSelector).all();
  }

  public $(cssSelector: string): Locator {
    return this.context.locator(cssSelector);
  }
}
