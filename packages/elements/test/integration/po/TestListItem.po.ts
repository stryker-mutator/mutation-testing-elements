import { PageObject } from './PageObject.po';

export class TestListItem extends PageObject {
  private get button() {
    return this.$('button');
  }

  public async isSelected() {
    const cssClasses = await this.button.getAttribute('class');
    return cssClasses.includes('active');
  }

  public toggle() {
    return this.button.click();
  }
}
