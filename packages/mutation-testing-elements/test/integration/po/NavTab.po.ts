import { PageObject } from './PageObject.po';

export class NavTab extends PageObject {
  async isActive() {
    const link = await this.anchorLink();
    const cssClasses = await link.getAttribute('class');
    return cssClasses.includes('active');
  }

  async text() {
    return this.host.getText();
  }

  async navigate() {
    const link = await this.anchorLink();
    return link.click();
  }

  private anchorLink() {
    return this.$('a.nav-link');
  }
}
