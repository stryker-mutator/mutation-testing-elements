import { PageObject } from './PageObject.po';

export class Checkbox extends PageObject {
  public async isChecked() {
    const val = await this.host.getAttribute('checked');
    return !!val;
  }

  public click() {
    return this.host.click();
  }
}
