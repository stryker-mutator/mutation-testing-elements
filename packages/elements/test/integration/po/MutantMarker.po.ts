import { MutantElement } from './MutantElement.po.js';

export class MutantMarker extends MutantElement {
  async underlineIsVisible() {
    const underlineStyle = await this.host.evaluate<string>((el) => window.getComputedStyle(el).borderBottomStyle);
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
