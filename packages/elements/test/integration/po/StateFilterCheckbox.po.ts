import { PageObject } from './PageObject.po.js';

export class StateFilterCheckbox extends PageObject {
  public click() {
    return this.host.click();
  }

  public text() {
    return this.host.innerText();
  }

  get input() {
    return this.$('input');
  }
}
