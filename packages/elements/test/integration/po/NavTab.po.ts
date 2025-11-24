import { PageObject } from './PageObject.po.js';

export class NavTab extends PageObject {
  async isActive() {
    const link = this.#anchorLink();
    const cssClasses = await link.getAttribute('aria-selected');
    return cssClasses === 'true';
  }

  async text() {
    return this.host.innerText();
  }

  async navigate() {
    const link = this.#anchorLink();
    return link.click();
  }

  #anchorLink() {
    return this.$('a');
  }
}
