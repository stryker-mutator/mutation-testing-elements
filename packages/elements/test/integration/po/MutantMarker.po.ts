import { MutantElement } from './MutantElement.po';

export class MutantMarker extends MutantElement {
  async underlineIsVisible() {
    const underlineStyle = await this.browser.executeScript<string>('return window.getComputedStyle(arguments[0]).borderBottomStyle;', this.host);
    switch (underlineStyle) {
      case 'solid':
        return true;
      case 'none':
        return false;
      default:
        throw new Error(`Underline style "${underlineStyle}" is not supported`);
    }
  }
}
