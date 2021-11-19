import { PageObject } from './PageObject.po';

export class TestListItem extends PageObject {
  public async isSelected() {
    const cssClasses = (await this.host.getAttribute('class')).split(' ');
    return cssClasses.includes('active');
  }

  public toggle() {
    return this.host.click();
  }
}
