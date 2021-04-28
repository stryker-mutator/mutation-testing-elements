import { PageObject } from './PageObject.po';

export class StateFilterCheckbox extends PageObject {
  public async isChecked() {
    const val = await this.$('input').getAttribute('checked');
    return !!val;
  }

  public click() {
    return this.host.click();
  }

  public text() {
    return this.host.getText();
  }
}
