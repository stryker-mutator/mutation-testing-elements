import { PageObject } from './PageObject.po';

export class TestListItem extends PageObject {
  public async isSelected() {
    return (await this.host.getAttribute('data-active')) === 'true';
  }

  public toggle() {
    return this.host.click();
  }
}
