import { MutantElement } from './MutantElement.po.js';

export class MutantMarker extends MutantElement {
  async underlineIsVisible() {
    // First try text-decoration, then border-bottom
    return (await this.#styleMatches('textDecorationLine', 'underline')) || (await this.#styleMatches('borderBottomStyle', 'solid'));
  }

  async #styleMatches(property: keyof CSSStyleDeclaration & string, trueCase: string, falseCase = 'none') {
    const style = (await this.host.evaluate((el, property) => window.getComputedStyle(el)[property], property)) as string;
    switch (style) {
      case trueCase:
        return true;
      case falseCase:
        return false;
      default:
        throw new Error(`${property} style "${style}" is not supported`);
    }
  }
}
